const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

exports.processChangeData = async (req, res) => {
    try {
        const changeRecords = [];
        const outputPath = path.join(__dirname, '../data/change_analysis.json');

        // Read CSV file for change records
        await new Promise((resolve, reject) => {
            fs.createReadStream(path.join(__dirname, '../data/synthetic_changes_new_icon23.csv'))
                .pipe(csv())
                .on('data', (row) => {
                    if (row['Impacted CIs']) {
                        changeRecords.push({
                            changeId: row['Change ID'],
                            impactedCIs: row['Impacted CIs'].split(',').map(ci => ci.trim()),
                            description: row['Description of change'],
                            category: row['Change Category'],
                            implementationDate: row['Timestamp']
                        });
                    }
                })
                .on('end', resolve)
                .on('error', reject);
        });

        // Read and process relationship data once
        const relationshipPath = path.join(__dirname, '../data/relationship_raw.json');
        const relationshipData = JSON.parse(fs.readFileSync(relationshipPath, 'utf8'));

        // Process CI Data once for all records
        const ciDataResult = await processCIData(relationshipData);

        // Process each change record using the same ciDataResult
        const analysisResults = [];
        for (const record of changeRecords) {
            // Use existing ciDataResult for impact analysis
            const impactAnalysis = await analyzeImpact({
                affetcedCI: {
                    selectedCI: record.impactedCIs.map(ci => ({
                        name: ci,
                        ip_address: getCIIP(ci),
                        category: getCICategory(ci),
                        subcategory: getCISubcategory(ci)
                    })),
                    firewall: {
                        name: 'Web Application Firewall',
                        ip_address: getFirewallIP()
                    }
                },
                relationshipData: ciDataResult
            });

            // Process IP data with impact analysis results
            const ipAnalysis = await processIpData(impactAnalysis.data);

            analysisResults.push({
                changeRecord: record,
                relationshipAnalysis: ciDataResult,
                impactAnalysis: impactAnalysis.data,
                trafficAnalysis: ipAnalysis.data
            });
        }

        // Save results
        const outputData = {
            timestamp: new Date().toISOString(),
            totalRecords: analysisResults.length,
            analysis: analysisResults,
            relationships: ciDataResult // Store processed relationships for reference
        };

        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

        res.status(200).json({
            success: true,
            message: 'Change data processed successfully',
            data: {
                recordsProcessed: analysisResults.length,
                outputPath
            }
        });

    } catch (error) {
        console.error('Error processing change data:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing change data',
            error: error.message
        });
    }
};

// Helper functions to process relationship data
async function processCIData(relationshipData) {
    const validRelationshipTypes = [
        'Runs on::Runs',
        'Connects to::Connected by',
        'Depends on::Used by',
        'Hosted on::Hosts'
    ];
    
    const componentMap = new Map();

    // Initialize component map
    relationshipData.forEach(relation => {

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
                    runsOnParents: new Set(),
                    runsOnChildren: new Set()
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

        const excludedComponents = ['IAM Role', 'Role', 'Cloudwatch', 'Cloud HSM', 'S3 Bucket', 'Active Directory services', 'Direct Connect', 'Route 53', 'VPN Nat Gateway', 'Internet Gateway'];
        if (!excludedComponents.includes(child.name)) {
            parentComponent.children.add(child.name);
            childComponent.parents.add(parent.name);
            
            parentComponent.relationships.set(child.name, relation.type.name);
            childComponent.relationships.set(parent.name, relation.type.name);

            if (relation.type.name === 'Runs on::Runs') {
                parentComponent.runsOn.runsOnChildren.add(child.name);
                childComponent.runsOn.runsOnParents.add(parent.name);
            }
        }
    });

    // Convert to final structure
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

    const sortedComponents = components.sort((a, b) => {
        if (a.parents.length === 0 && b.parents.length > 0) return -1;
        if (b.parents.length === 0 && a.parents.length > 0) return 1;
        
        const aHasRunsOn = a.runsOn.runsOnChildren.length > 0;
        const bHasRunsOn = b.runsOn.runsOnChildren.length > 0;
        
        if (aHasRunsOn && !bHasRunsOn) return -1;
        if (!aHasRunsOn && bHasRunsOn) return 1;
        
        return b.children.length - a.children.length;
    });

    return {
        hierarchy: sortedComponents,
        relationshipGroups: {
            runningComponents: sortedComponents.filter(component => 
                component.runsOn.runsOnChildren.length > 0 || 
                component.runsOn.runsOnParents.length > 0
            ),
            connectedComponents: sortedComponents.filter(component => 
                Object.values(component.relationships).some(
                    type => type === 'Connects to::Connected by'
                )
            )
        }
    };
}

// Helper function to analyze impact
async function analyzeImpact(data) {
    const { affetcedCI, relationshipData } = data;
    const selectedCIs = affetcedCI.selectedCI;
    const firewall = affetcedCI.firewall;
    const otherCIs = affetcedCI.otherCI || [];
    
    // Get hierarchy data
    const hierarchy = relationshipData.hierarchy;
    
    const directlyImpacted = new Set();
    const partiallyImpacted = new Set();
    const impactedIPs = new Map();

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
            if (isInfrastructureComponent(parentName)) {
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

    // Remove directly impacted from partially impacted
    directlyImpacted.forEach(name => partiallyImpacted.delete(name));
    
    // Calculate severity
    const totalImpact = directlyImpacted.size + partiallyImpacted.size;
    let severity = totalImpact > 8 ? 'HIGH' : totalImpact > 4 ? 'MEDIUM' : 'LOW';

    return {
        success: true,
        message: 'Impact analysis completed successfully',
        data: {
            affectedCIs: selectedCIs.map(ci => ci.name),
            directImpact: Array.from(directlyImpacted),
            partialImpact: Array.from(partiallyImpacted),
            impactedIPs: Array.from(impactedIPs.entries()).map(([component, ip]) => ({
                component,
                ip,
                impactType: selectedCIs.some(ci => ci.name === component) ? 'affected' : 
                          directlyImpacted.has(component) ? 'direct' : 'partial'
            })),
            metadata: {
                totalComponents: totalImpact,
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
}

// Helper function to process IP data
async function processIpData(data) {
    try {
        const teamRecords = new Map();
        const filePath = path.join(__dirname, '../data/syntheticData.csv');
        const impactAnalysis = data;

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
                    .on('end', resolve)
                    .on('error', reject);
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

        return {
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

    } catch (error) {
        console.error('Error processing IP data:', error);
        throw error;
    }
}

// Utility functions to get CI details
function getCIIP(ciName) {
    // Read from IP data file and return IP
    const ipData = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../data/ip_raw.json'), 'utf8'
    ));
    return ipData.result.find(item => item.name === ciName)?.ip_address || null;
}

function getCICategory(ciName) {
    const ipData = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../data/ip_raw.json'), 'utf8'
    ));
    return ipData.result.find(item => item.name === ciName)?.category || null;
}

function getCISubcategory(ciName) {
    const ipData = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../data/ip_raw.json'), 'utf8'
    ));
    return ipData.result.find(item => item.name === ciName)?.subcategory || null;
}

function getFirewallIP() {
    const ipData = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../data/ip_raw.json'), 'utf8'
    ));
    return ipData.result.find(item => 
        item.name === 'Web Application Firewall'
    )?.ip_address || null;
}

exports.getChangeImpactData = async (req, res) => {
    try {
        const { changeId } = req.params;
        
        // Read change analysis data
        const analysisPath = path.join(__dirname, '../data/change_analysis.json');
        const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

        // Find matching change record
        const changeRecord = analysisData.analysis.find(record => 
            record.changeRecord.changeId === changeId
        );

        if (!changeRecord) {
            return res.status(404).json({
                success: false,
                message: `No analysis found for change ID: ${changeId}`
            });
        }

        // Group data by teams
        const teams = new Map();
        
        // Get all impacted CIs and their IPs
        const impactedCIs = new Set([
            ...changeRecord.impactAnalysis.affectedCIs,
            ...changeRecord.impactAnalysis.directImpact,
            ...changeRecord.impactAnalysis.partialImpact
        ]);

        changeRecord.trafficAnalysis.teams.forEach(teamData => {
            const team = teamData.team;
            const impactedTeamCIs = teamData.records
                .filter(record => impactedCIs.has(record.ciName))
                .map(record => ({
                    ciName: record.ciName,
                    ports: record.ports.map(port => ({
                        event: port.event || 'Access',
                        protocol: port.protocol,
                        ids: [port.id].filter(Boolean)
                    }))
                }));

            if (impactedTeamCIs.length > 0) {
                teams.set(team, impactedTeamCIs);
            }
        });

        // Format response
        const formattedTeams = Array.from(teams.entries()).map(([teamName, ciData]) => ({
            team: teamName,
            impactedCIs: ciData
        }));

        res.status(200).json({
            success: true,
            message: 'Change impact data retrieved successfully',
            data: {
                teams: formattedTeams,
                metadata: {
                    changeId,
                    totalTeams: formattedTeams.length,
                    totalCIs: impactedCIs.size,
                    severity: changeRecord.impactAnalysis.severity
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving change impact data:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving change impact data',
            error: error.message
        });
    }
};

async function updateChangeAnalysis(inputData) {
    try {
        const outputPath = path.join(__dirname, '../data/curr_impact_analysis.json');
        let analysisData;

        // Read existing change analysis data
        try {
            analysisData = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        } catch (error) {
            // Initialize new structure if file doesn't exist
            analysisData = {
                timestamp: new Date().toISOString(),
                totalRecords: 0,
                analysis: [],
                relationships: {}
            };
        }

        // Format the input data
        const formattedAnalysis = {
            changeRecord: {
                changeId: inputData.change_id,
                impactedCIs: inputData.impact.affectedCIs,
                // Add other required fields with default values
                description: inputData.change_description,
                category: "Impact Analysis",
                implementationDate: new Date().toISOString()
            },
            relationshipAnalysis: inputData.relationship,
            impactAnalysis: inputData.impact,
            trafficAnalysis: inputData.ipData
        };

        // Check if change ID already exists
        const existingRecordIndex = analysisData.analysis.findIndex(
            record => record.changeRecord.changeId === inputData.change_id
        );

        if (existingRecordIndex !== -1) {
            // Update existing record
            analysisData.analysis[existingRecordIndex] = formattedAnalysis;
        } else {
            // Add new record
            analysisData.analysis.push(formattedAnalysis);
        }

        // Update metadata
        analysisData.timestamp = new Date().toISOString();
        analysisData.totalRecords = analysisData.analysis.length;

        // Save updated data
        fs.writeFileSync(outputPath, JSON.stringify(analysisData, null, 2));

        return {
            success: true,
            message: `Change analysis ${existingRecordIndex !== -1 ? 'updated' : 'added'} successfully`,
            data: {
                changeId: inputData.change_id,
                isUpdate: existingRecordIndex !== -1
            }
        };

    } catch (error) {
        console.error('Error updating change analysis:', error);
        throw error;
    }
}

// Add new controller endpoint
exports.updateChangeData = async (req, res) => {
    try {
        const result = await updateChangeAnalysis(req.body);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateChangeData:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating change data',
            error: error.message
        });
    }
};

exports.getCurrentChangeImpactData = async (req, res) => {
    try {
        const { changeId } = req.params;
        
        // Read current change analysis data
        const analysisPath = path.join(__dirname, '../data/curr_impact_analysis.json');
        const analysisData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));

        // Find matching change record
        const changeRecord = analysisData.analysis.find(record => 
            record.changeRecord.changeId === changeId
        );

        if (!changeRecord) {
            return res.status(404).json({
                success: false,
                message: `No analysis found for change ID: ${changeId}`
            });
        }

        // Group data by teams
        const teams = new Map();
        
        // Get all impacted CIs and their IPs
        const impactedCIs = new Set([
            ...changeRecord.impactAnalysis.affectedCIs,
            ...changeRecord.impactAnalysis.directImpact,
            ...changeRecord.impactAnalysis.partialImpact
        ]);

        // Process team data
        if (changeRecord.trafficAnalysis && changeRecord.trafficAnalysis.teams) {
            changeRecord.trafficAnalysis.teams.forEach(teamData => {
                const team = teamData.team;
                const impactedTeamCIs = teamData.records
                    .filter(record => impactedCIs.has(record.ciName))
                    .map(record => ({
                        ciName: record.ciName,
                        ports: record.ports.map(port => ({
                            event: port.event || 'Access',
                            protocol: port.protocol,
                            ids: [port.id].filter(Boolean)
                        }))
                    }));

                if (impactedTeamCIs.length > 0) {
                    teams.set(team, impactedTeamCIs);
                }
            });
        }

        // Format response
        const formattedTeams = Array.from(teams.entries()).map(([teamName, ciData]) => ({
            team: teamName,
            impactedCIs: ciData
        }));

        res.status(200).json({
            success: true,
            message: 'Current change impact data retrieved successfully',
            data: {
                teams: formattedTeams,
                metadata: {
                    changeId,
                    description: changeRecord.changeRecord.description,
                    totalTeams: formattedTeams.length,
                    totalCIs: impactedCIs.size,
                    severity: changeRecord.impactAnalysis.severity || 'MEDIUM'
                }
            }
        });

    } catch (error) {
        console.error('Error retrieving current change impact data:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving current change impact data',
            error: error.message
        });
    }
};