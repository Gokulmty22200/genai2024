const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

exports.processCIData = async (req, res) => {
    try {
        const ciData = req.body;
        
        const hierarchy = {
            level1: { firewalls: [] },
            level2: { loadBalancers: [] },
            level3: { servers: [] },
            level4: { applications: [] },
            level5: { databases: [] }
        };

        // Helper function to check if item already exists in array
        const isUnique = (arr, item) => !arr.some(x => x.component.value === item.value);

        // First pass - identify all components from both parent and child
        ciData.forEach(relation => {
            // Process parent components
            processComponent(relation.parent);
            // Process child components
            processComponent(relation.child);
        });

        function processComponent(component) {
            const type = getComponentType(component);
            switch(type) {
                case 'firewall':
                    if (isUnique(hierarchy.level1.firewalls, component)) {
                        hierarchy.level1.firewalls.push({
                            component: component,
                            downstream: []
                        });
                    }
                    break;
                case 'loadBalancer':
                    if (isUnique(hierarchy.level2.loadBalancers, component)) {
                        hierarchy.level2.loadBalancers.push({
                            component: component,
                            upstream: [],
                            downstream: []
                        });
                    }
                    break;
                case 'server':
                    if (isUnique(hierarchy.level3.servers, component)) {
                        hierarchy.level3.servers.push({
                            component: component,
                            upstream: [],
                            downstream: []
                        });
                    }
                    break;
                case 'application':
                    if (isUnique(hierarchy.level4.applications, component)) {
                        hierarchy.level4.applications.push({
                            component: component,
                            upstream: [],
                            downstream: []
                        });
                    }
                    break;
                case 'database':
                    if (isUnique(hierarchy.level5.databases, component)) {
                        hierarchy.level5.databases.push({
                            component: component,
                            upstream: []
                        });
                    }
                    break;
            }
        }

        // Second pass - establish relationships
        ciData.forEach(relation => {
            establishRelationship(relation);
        });

        function establishRelationship(relation) {
            const parentType = getComponentType(relation.parent);
            const childType = getComponentType(relation.child);
            
            // Find components in their respective levels
            const parent = findComponentInHierarchy(relation.parent);
            const child = findComponentInHierarchy(relation.child);

            if (parent && child) {
                // Add downstream relationship to parent
                const downstream = {
                    componentType: childType,
                    reference: relation.child
                };
                if (!parent.downstream.some(d => d.reference.value === downstream.reference.value)) {
                    parent.downstream.push(downstream);
                }

                // Add upstream relationship to child (except for databases which only have upstream)
                if ( child.upstream) {
                    const upstream = {
                        componentType: parentType,
                        reference: relation.parent
                    };
                    if (!child.upstream.some(u => u.reference.value === upstream.reference.value)) {
                        child.upstream.push(upstream);
                    }
                }
            }
        }

        function findComponentInHierarchy(component) {
            const type = getComponentType(component);
            switch(type) {
                case 'firewall':
                    return hierarchy.level1.firewalls.find(f => f.component.value === component.value);
                case 'loadBalancer':
                    return hierarchy.level2.loadBalancers.find(lb => lb.component.value === component.value);
                case 'server':
                    return hierarchy.level3.servers.find(s => s.component.value === component.value);
                case 'application':
                    return hierarchy.level4.applications.find(a => a.component.value === component.value);
                case 'database':
                    return hierarchy.level5.databases.find(d => d.component.value === component.value);
                default:
                    return null;
            }
        }

        function getComponentType(component) {
            const name = component.name.toUpperCase();
            if (name.includes('FIREWALL')) return 'firewall';
            if (name.includes('LOAD BALANCER')) return 'loadBalancer';
            if (name.includes('SERVER')) return 'server';
            if (name.includes('APPLICATION') && !name.includes('SERVER')) return 'application';
            if (name.includes('DB') || name.includes('DATABASE') || /CUST-DB-\d+/.test(name)) return 'database';
            return 'unknown';
        }

        res.status(200).json({
            success: true,
            message: 'CI data processed successfully',
            data: hierarchy
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing CI data',
            error: error.message
        });
    }
};

exports.processIpData = async (req, res) => {
    try {
        const requestData = req.body;
        const teamRecords = new Map();
        
        const filePath = path.join(__dirname, '../data/synthetic_data.csv');

        for (const item of requestData) {
            const { firewall, selectedCI } = item;
            const firewallIps = firewall.map(fw => fw.ip_address);
            const ciIps = selectedCI.map(ci => ci.ip_address);

            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (record) => {
                        if (firewallIps.includes(record.DeviceVendor) && 
                            ciIps.includes(record.Destination)) {
                            
                            const team = record.Team || 'Unassigned';
                            const key = `${team}-${record.Destination}`;

                            if (!teamRecords.has(key)) {
                                teamRecords.set(key, {
                                    team,
                                    deviceVendor: new Set([record.DeviceVendor]),
                                    destination: new Set([record.Destination]),
                                    port: new Set([JSON.stringify({ id: record.Port, eventId: record.EventID })]),
                                    ciName: selectedCI.find(ci => ci.ip_address === record.Destination)?.name,
                                });
                            } else {
                                const existingRecord = teamRecords.get(key);
                                existingRecord.deviceVendor.add(record.DeviceVendor);
                                existingRecord.port.add(JSON.stringify({ id: record.Port, eventId: record.EventID }));
                            }
                        }
                    })
                    .on('end', () => resolve())
                    .on('error', (error) => reject(error));
            });
        }

        if (teamRecords.size === 0) {
            return res.status(404).json({
                success: false,
                message: 'No matching traffic records found',
                data: []
            });
        }

        // Group by team and format response
        const groupedByTeam = Array.from(teamRecords.values()).reduce((acc, record) => {
            const existingTeam = acc.find(t => t.team === record.team);
            const formattedRecord = {
                deviceVendor: Array.from(record.deviceVendor),
                destination: Array.from(record.destination),
                port: Array.from(record.port).map(p => JSON.parse(p)),
                ciName: record.ciName
            };

            if (!existingTeam) {
                acc.push({
                    team: record.team,
                    records: [formattedRecord]
                });
            } else {
                existingTeam.records.push(formattedRecord);
            }
            return acc;
        }, []);

        res.status(200).json({
            success: true,
            message: 'Traffic data retrieved successfully',
            data: groupedByTeam
        });

    } catch (error) {
        console.error('Error processing IP data:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing IP data',
            error: error.message
        });
    }
};