const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

exports.processCIData = async (req, res) => {
    try {
        const ciData = req.body;
        const validRelationshipTypes = [
            'Runs on::Runs',
            'Connects to::Connected by',
            'Depends on::Used by',
            'Hosted on::Hosts'
        ];
        // Create maps to store components and their relationships
        const componentMap = new Map();
        const runsOnMap = new Map(); 
        // Initialize component map with empty arrays for parents and children
        ciData.forEach(relation => {
            if (!validRelationshipTypes.includes(relation.type.name)) {
                return;
            }

            const { parent, child } = relation;

            if (!componentMap.has(parent.name)) {
                componentMap.set(parent.name, {
                    componentName: parent.name,
                    id: parent.value,
                    parents: new Set(),
                    children: new Set(),
                    relationships: new Map(),
                    runsOn: {
                        runsOnParents: new Set(),  // Components this one runs on
                        runsOnChildren: new Set()   // Components that run on this
                    }
                });
            }

            if (!componentMap.has(child.name)) {
                componentMap.set(child.name, {
                    componentName: child.name,
                    id: child.value,
                    parents: new Set(),
                    children: new Set(),
                    relationships: new Map(),
                    runsOn: {
                        runsOnParents: new Set(),
                        runsOnChildren: new Set()
                    }
                });
            }

            const parentComponent = componentMap.get(parent.name);
            const childComponent = componentMap.get(child.name);

            // Skip utility components
            const excludedComponents = ['IAM Role', 'Role', 'Cloudwatch', 'Cloud HSM', 'S3 Bucket', 'Active Directory services', 'Route 53', 'VPN Nat Gateway'];
            if (!excludedComponents.includes(child.name)) {
                parentComponent.children.add(child.name);
                childComponent.parents.add(parent.name);
                
                // Store relationship type
                parentComponent.relationships.set(child.name, relation.type.name);
                childComponent.relationships.set(parent.name, relation.type.name);

                // Handle Runs on relationships
                if (relation.type.name === 'Runs on::Runs') {
                    parentComponent.runsOn.runsOnChildren.add(child.name);
                    childComponent.runsOn.runsOnParents.add(parent.name);
                }
            }
        });

        // Convert sets to arrays and create final structure
        const components = Array.from(componentMap.values())
            .map(component => ({
                componentName: component.componentName,
                id: component.id,
                parents: Array.from(component.parents),
                children: Array.from(component.children),
                relationships: Object.fromEntries(component.relationships),
                runsOn: {
                    runsOnParents: Array.from(component.runsOn.runsOnParents),
                    runsOnChildren: Array.from(component.runsOn.runsOnChildren)
                }
            }))
            .filter(component => {
                const excludedNames = ['IAM Role', 'Role', 'Cloudwatch', 'Cloud HSM', 'S3 Bucket', 'Active Directory services', 'Direct Connect', 'Route 53', 'VPN Nat Gateway', 'Internet Gateway'];
                return !excludedNames.includes(component.componentName);
            });

        // Sort components
        const sortedComponents = components.sort((a, b) => {
            if (a.parents.length === 0 && b.parents.length > 0) return -1;
            if (b.parents.length === 0 && a.parents.length > 0) return 1;
            
            const aHasRunsOn = a.runsOn.runsOnChildren.length > 0;
            const bHasRunsOn = b.runsOn.runsOnChildren.length > 0;
            
            if (aHasRunsOn && !bHasRunsOn) return -1;
            if (!aHasRunsOn && bHasRunsOn) return 1;
            
            return b.children.length - a.children.length;
        });

        // Group components by relationship type
        const groupedComponents = {
            runningComponents: sortedComponents.filter(component => 
                component.runsOn.runsOnChildren.length > 0 || component.runsOn.runsOnParents.length > 0
            ),
            connectedComponents: sortedComponents.filter(component => 
                Object.values(component.relationships).some(type => type === 'Connects to::Connected by')
            )
        };

        res.status(200).json({
            success: true,
            message: 'CI data processed successfully',
            data: {
                hierarchy: sortedComponents,
                relationshipGroups: groupedComponents,
                metadata: {
                    totalComponents: sortedComponents.length,
                    rootNodes: sortedComponents.filter(c => c.parents.length === 0).length,
                    leafNodes: sortedComponents.filter(c => c.children.length === 0).length,
                    runningComponents: groupedComponents.runningComponents.length,
                    connectedComponents: groupedComponents.connectedComponents.length,
                    runsOnRelationships: sortedComponents.reduce((acc, curr) => 
                        acc + curr.runsOn.runsOnChildren.length, 0
                    )
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

exports.processIpData = async (req, res) => {
    try {
        // Extract impact analysis data
        const impactAnalysis = req.body;
        const teamRecords = new Map();
        
        const filePath = path.join(__dirname, '../data/syntheticData.csv');

        // Get all impacted IPs including affected, direct, and partial impacts
        const impactedIPsList = impactAnalysis.impactedIPs.map(ip => ({
            ip: ip.ip,
            name: ip.component,
            type: ip.impactType
        }));

        // Process each impacted IP
        for (const impactedIP of impactedIPsList) {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on('data', (record) => {
                        // Only check Destination column match
                        if (record.Destination === impactedIP.ip) {
                            const team = record.Team || 'Unassigned';
                            const key = `${team}-${record.Destination}-${impactedIP.type}`;

                            if (!teamRecords.has(key)) {
                                teamRecords.set(key, {
                                    team,
                                    deviceVendor: new Set([record.DeviceVendor]),
                                    destination: record.Destination,
                                    ports: new Set([JSON.stringify({ 
                                        id: record.Port, 
                                        eventId: record.EventID,
                                        protocol: record.Protocol
                                    })]),
                                    ciName: impactedIP.name,
                                    impactType: impactedIP.type
                                });
                            } else {
                                const existingRecord = teamRecords.get(key);
                                existingRecord.deviceVendor.add(record.DeviceVendor);
                                existingRecord.ports.add(JSON.stringify({ 
                                    id: record.Port, 
                                    eventId: record.EventID,
                                    protocol: record.Protocol
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
                destination: record.destination,
                ports: Array.from(record.ports).map(p => JSON.parse(p)),
                ciName: record.ciName,
                impactType: record.impactType
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

        const response = {
            success: true,
            message: 'Traffic data retrieved successfully',
            data: {
                teams: groupedByTeam,
                metadata: {
                    totalTeams: groupedByTeam.length,
                    impactSummary: {
                        affected: impactedIPsList.filter(ip => ip.type === 'affected').length,
                        direct: impactedIPsList.filter(ip => ip.type === 'direct').length,
                        partial: impactedIPsList.filter(ip => ip.type === 'partial').length
                    },
                    severity: impactAnalysis.severity
                },
                affectedCI: {
                    name: impactAnalysis.details.affectedCIDetails.name,
                    category: impactAnalysis.details.affectedCIDetails.category,
                    subcategory: impactAnalysis.details.affectedCIDetails.subcategory
                }
            }
        };

        res.status(200).json(response);

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

exports.analyzeImpact = async (req, res) => {
    try {
        const { affetcedCI, relationshipData } = req.body;
        const selectedCIs = affetcedCI.selectedCI;
        const firewall = affetcedCI.firewall;
        const otherCIs = affetcedCI.otherCI || [];
        
        const hierarchy = relationshipData.hierarchy;
        const directlyImpacted = new Set();
        const partiallyImpacted = new Set();
        const impactedIPs = new Map();
        const affectedCINames = new Set(selectedCIs.map(ci => ci.name));

        // Helper functions
        const getComponentIP = (componentName) => {
            const selectedCI = selectedCIs.find(ci => ci.name === componentName);
            if (selectedCI?.ip_address) {
                return selectedCI.ip_address;
            }
            
            if (ciIPMapping.has(componentName)) {
                return ciIPMapping.get(componentName);
            }

            if (componentName === firewall.name) {
                return firewall.ip_address;
            }

            return null;
        };

        const isInfrastructureComponent = (name) => {
            return ['Web Application Firewall', 'Application Load Balancer'].includes(name);
        };

        const traverseUpstream = (nodeName, isDirectImpact = false) => {
            const node = hierarchy.find(n => n.componentName === nodeName);
            if (!node) return;

            node.parents.forEach(parentName => {
                if (isInfrastructureComponent(parentName) || affectedCINames.has(parentName)) {
                    return;
                }

                const parentNode = hierarchy.find(n => n.componentName === parentName);
                if (parentNode) {
                    if (isDirectImpact) {
                        partiallyImpacted.add(parentName);
                        traverseUpstream(parentName, false);
                    } else {
                        partiallyImpacted.add(parentName);
                        traverseUpstream(parentName, false);
                    }

                    const ip = getComponentIP(parentName);
                    if (ip) {
                        impactedIPs.set(parentName, ip);
                    }
                }
            });
        };

        const traverseDownstream = (nodeName, isDirectImpact = false) => {
            const node = hierarchy.find(n => n.componentName === nodeName);
            if (!node) return;

            node.children.forEach(childName => {
                if (affectedCINames.has(childName)) {
                    return;
                }

                const childNode = hierarchy.find(n => n.componentName === childName);
                if (childNode) {
                    if (isDirectImpact) {
                        directlyImpacted.add(childName);
                    } else {
                        partiallyImpacted.add(childName);
                    }

                    const ip = getComponentIP(childName);
                    if (ip) {
                        impactedIPs.set(childName, ip);
                    }
                }
            });
        };

        // Create IP mapping
        const ciIPMapping = new Map();
        otherCIs.forEach(ci => {
            if (ci.ip_address && ci.name) {
                ciIPMapping.set(ci.name, ci.ip_address);
            }
        });

        // Process each selected CI
        for (const selectedCI of selectedCIs) {
            const affectedNode = hierarchy.find(node => node.componentName === selectedCI.name);
            if (!affectedNode) continue;

            if (selectedCI.ip_address) {
                impactedIPs.set(selectedCI.name, selectedCI.ip_address);
            }

            traverseUpstream(selectedCI.name, true);
            traverseDownstream(selectedCI.name, true);
        }

        // Remove affected CIs from impact lists
        affectedCINames.forEach(name => {
            directlyImpacted.delete(name);
            partiallyImpacted.delete(name);
        });
        
        // Calculate severity
        let severity;
        const totalImpact = directlyImpacted.size + partiallyImpacted.size;
        if (totalImpact > 8) {
            severity = 'HIGH';
        } else if (totalImpact > 4) {
            severity = 'MEDIUM';
        } else {
            severity = 'LOW';
        }

        const response = {
            success: true,
            message: 'Impact analysis completed successfully',
            data: {
                affectedCIs: selectedCIs.map(ci => ci.name),
                directImpact: Array.from(directlyImpacted),
                partialImpact: Array.from(partiallyImpacted),
                impactedIPs: Array.from(impactedIPs.entries()).map(([component, ip]) => ({
                    component,
                    ip,
                    impactType: affectedCINames.has(component) ? 'affected' : 
                              directlyImpacted.has(component) ? 'direct' : 'partial'
                })),
                metadata: {
                    totalComponents: totalImpact + selectedCIs.length,
                    directlyImpactedCount: directlyImpacted.size,
                    partiallyImpactedCount: partiallyImpacted.size,
                    impactedIPsCount: impactedIPs.size,
                    affectedCICount: selectedCIs.length
                },
                severity,
                details: {
                    affectedCIDetails: selectedCIs.map(ci => ({
                        name: ci.name,
                        ip: ci.ip_address,
                        category: ci.category,
                        subcategory: ci.subcategory
                    })),
                    firewallDetails: {
                        name: firewall.name,
                        ip: firewall.ip_address
                    }
                }
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error analyzing impact:', error);
        res.status(500).json({
            success: false,
            message: 'Error analyzing impact',
            error: error.message
        });
    }
};