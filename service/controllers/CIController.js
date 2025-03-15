const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

exports.processCIData = async (req, res) => {
    try {
        const ciData = req.body;
        
        // Create a map to store components and their relationships
        const componentMap = new Map();

        // Initialize component map with empty arrays for parents and children
        ciData.forEach(relation => {
            const { parent, child } = relation;

            if (!componentMap.has(parent.name)) {
                componentMap.set(parent.name, {
                    componentName: parent.name,
                    id: parent.value,
                    parents: new Set(),
                    children: new Set()
                });
            }

            if (!componentMap.has(child.name)) {
                componentMap.set(child.name, {
                    componentName: child.name,
                    id: child.value,
                    parents: new Set(),
                    children: new Set()
                });
            }

            // Add parent-child relationships
            const parentComponent = componentMap.get(parent.name);
            const childComponent = componentMap.get(child.name);

            // Skip IAM Role, Role, Cloudwatch, Cloud HSM, and S3 Bucket relationships
            const excludedComponents = ['IAM Role', 'Role', 'Cloudwatch', 'Cloud HSM', 'S3 Bucket'];
            if (!excludedComponents.includes(child.name)) {
                parentComponent.children.add(child.name);
                childComponent.parents.add(parent.name);
            }
        });

        // Convert sets to arrays and create final structure
        const components = Array.from(componentMap.values())
            .map(component => ({
                componentName: component.componentName,
                id: component.id,
                parents: Array.from(component.parents),
                children: Array.from(component.children)
            }))
            .filter(component => {
                // Filter out utility components
                const excludedNames = ['IAM Role', 'Role', 'Cloudwatch', 'Cloud HSM', 'S3 Bucket'];
                return !excludedNames.includes(component.componentName);
            });

        // Sort components by hierarchy (root nodes first, leaf nodes last)
        const sortedComponents = components.sort((a, b) => {
            // Root nodes (no parents) come first
            if (a.parents.length === 0 && b.parents.length > 0) return -1;
            if (b.parents.length === 0 && a.parents.length > 0) return 1;
            
            // Then sort by number of children (more children = higher in hierarchy)
            return b.children.length - a.children.length;
        });

        res.status(200).json({
            success: true,
            message: 'CI data processed successfully',
            data: {
                hierarchy: sortedComponents,
                metadata: {
                    totalComponents: sortedComponents.length,
                    rootNodes: sortedComponents.filter(c => c.parents.length === 0).length,
                    leafNodes: sortedComponents.filter(c => c.children.length === 0).length
                }
            }
        });

    } catch (error) {
        console.error('Error processing CI data:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing CI data',
            error: error.message
        });
    }
};

// exports.processIpData = async (req, res) => {
//     try {
//         const requestData = req.body;
//         const teamRecords = new Map();
        
//         const filePath = path.join(__dirname, '../data/synthetic_data.csv');

//         for (const item of requestData) {
//             const { firewall, selectedCI } = item;
//             const firewallIps = firewall.map(fw => fw.ip_address);
//             const ciIps = selectedCI.map(ci => ci.ip_address);

//             await new Promise((resolve, reject) => {
//                 fs.createReadStream(filePath)
//                     .pipe(csv())
//                     .on('data', (record) => {
//                         if (firewallIps.includes(record.DeviceVendor) && 
//                             ciIps.includes(record.Destination)) {
                            
//                             const team = record.Team || 'Unassigned';
//                             const key = `${team}-${record.Destination}`;

//                             if (!teamRecords.has(key)) {
//                                 teamRecords.set(key, {
//                                     team,
//                                     deviceVendor: new Set([record.DeviceVendor]),
//                                     destination: new Set([record.Destination]),
//                                     port: new Set([JSON.stringify({ id: record.Port, eventId: record.EventID })]),
//                                     ciName: selectedCI.find(ci => ci.ip_address === record.Destination)?.name,
//                                 });
//                             } else {
//                                 const existingRecord = teamRecords.get(key);
//                                 existingRecord.deviceVendor.add(record.DeviceVendor);
//                                 existingRecord.port.add(JSON.stringify({ id: record.Port, eventId: record.EventID }));
//                             }
//                         }
//                     })
//                     .on('end', () => resolve())
//                     .on('error', (error) => reject(error));
//             });
//         }

//         if (teamRecords.size === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'No matching traffic records found',
//                 data: []
//             });
//         }

//         // Group by team and format response
//         const groupedByTeam = Array.from(teamRecords.values()).reduce((acc, record) => {
//             const existingTeam = acc.find(t => t.team === record.team);
//             const formattedRecord = {
//                 deviceVendor: Array.from(record.deviceVendor),
//                 destination: Array.from(record.destination),
//                 port: Array.from(record.port).map(p => JSON.parse(p)),
//                 ciName: record.ciName
//             };

//             if (!existingTeam) {
//                 acc.push({
//                     team: record.team,
//                     records: [formattedRecord]
//                 });
//             } else {
//                 existingTeam.records.push(formattedRecord);
//             }
//             return acc;
//         }, []);

//         res.status(200).json({
//             success: true,
//             message: 'Traffic data retrieved successfully',
//             data: groupedByTeam
//         });

//     } catch (error) {
//         console.error('Error processing IP data:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error processing IP data',
//             error: error.message
//         });
//     }
// };

exports.processIpData = async (req, res) => {
    try {
        // Normalize request data to use consistent structure
        const requestData = Array.isArray(req.body) ? req.body : [req.body];
        const teamRecords = new Map();
        
        const filePath = path.join(__dirname, '../data/syntheticData.csv');

        for (const item of requestData) {
            // Extract firewall and selectedCI from ServiceNow response format
            const firewall = {
                operational_status: item.firewall?.operational_status || '',
                managed_by: item.firewall?.managed_by || '',
                name: item.firewall?.name || '',
                serial_number: item.firewall?.serial_number || '',
                owned_by: item.firewall?.owned_by || '',
                ip_address: item.firewall?.ip_address || '',
                install_date: item.firewall?.sys_created_on || '',
                model_id: item.firewall?.model_id?.value || '',
                managed_by_group: item.firewall?.managed_by_group || ''
            };

            const selectedCI = {
                operational_status: item.selectedCI?.operational_status || '',
                managed_by: item.selectedCI?.managed_by || '',
                name: item.selectedCI?.name || '',
                serial_number: item.selectedCI?.serial_number || '',
                owned_by: item.selectedCI?.owned_by || '',
                ip_address: item.selectedCI?.ip_address || '',
                install_date: item.selectedCI?.sys_created_on || '',
                model_id: item.selectedCI?.model_id?.value || '',
                managed_by_group: item.selectedCI?.managed_by_group || ''
            };

            // Skip if no valid IPs
            if (!firewall.ip_address || !selectedCI.ip_address) {
                continue;
            }
            // record.DeviceVendor === firewall.ip_address && 
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (record) => {
                        if (record.Destination === selectedCI.ip_address) {
                            
                            const team = record.Team || 'Unassigned';
                            const key = `${team}-${record.Destination}`;

                            if (!teamRecords.has(key)) {
                                teamRecords.set(key, {
                                    team,
                                    deviceVendor: new Set([record.DeviceVendor]),
                                    destination: new Set([record.Destination]),
                                    port: new Set([JSON.stringify({ 
                                        id: record.Port, 
                                        eventId: record.EventID 
                                    })]),
                                    ciName: selectedCI.name
                                });
                            } else {
                                const existingRecord = teamRecords.get(key);
                                existingRecord.deviceVendor.add(record.DeviceVendor);
                                existingRecord.port.add(JSON.stringify({ 
                                    id: record.Port, 
                                    eventId: record.EventID 
                                }));
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

exports.impactedCI = async (req, res) => {
    try {
        const { impactedCIs, relationships } = req.body;
        
        const directlyImpacted = new Set();
        const partiallyImpacted = new Set();
        const topLevelComponents = new Set();
        
        // Function to get immediate parents of a component
        const getImmediateParents = (componentName) => {
            return relationships
                .filter(rel => rel.child.name === componentName)
                .map(rel => rel.parent.name);
        };

        // Function to traverse up the hierarchy
        const traverseHierarchy = (componentName, visited = new Set()) => {
            if (visited.has(componentName)) return;
            visited.add(componentName);

            const parents = getImmediateParents(componentName);
            
            parents.forEach(parent => {
                // Skip utility and infrastructure components
                const skipComponents = [
                    'IAM Role', 'Role', 'Cloudwatch', 'Cloud HSM', 'S3 Bucket',
                    'Web Application Firewall', 'Application Load Balancer'
                ];
                
                if (skipComponents.includes(parent)) {
                    topLevelComponents.add(parent);
                } else {
                    partiallyImpacted.add(parent);
                    traverseHierarchy(parent, visited);
                }
            });
        };

        // Get immediate parents of affected CI
        const immediateParents = getImmediateParents(impactedCIs);
        immediateParents.forEach(parent => {
            const infrastructureComponents = ['Web Application Firewall', 'Application Load Balancer'];
            if (!infrastructureComponents.includes(parent)) {
                directlyImpacted.add(parent);
                traverseHierarchy(parent);
            } else {
                topLevelComponents.add(parent);
            }
        });

        const impactAnalysis = {
            impactedCIs: impactedCIs,
            directImpact: Array.from(directlyImpacted),
            partialImpact: Array.from(partiallyImpacted),
            infrastructureComponents: Array.from(topLevelComponents),
            metadata: {
                totalImpactedComponents: directlyImpacted.size + partiallyImpacted.size,
                directlyImpactedCount: directlyImpacted.size,
                partiallyImpactedCount: partiallyImpacted.size,
                infrastructureComponentsCount: topLevelComponents.size
            }
        };

        // Calculate severity based on application impact
        const totalAppImpact = directlyImpacted.size + partiallyImpacted.size;
        let severity;
        if (totalAppImpact > 8) {
            severity = 'HIGH';
        } else if (totalAppImpact > 4) {
            severity = 'MEDIUM';
        } else {
            severity = 'LOW';
        }

        res.status(200).json({
            success: true,
            message: 'Impact analysis completed successfully',
            data: {
                ...impactAnalysis,
                severity,
                changeDetails: {
                    changeId: req.body.changeId,
                    description: req.body.description,
                    category: req.body.category,
                    implementationDate: req.body.implementationDate
                }
            }
        });

    } catch (error) {
        console.error('Error analyzing CI impact:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing CI impact',
            error: error.message
        });
    }
};