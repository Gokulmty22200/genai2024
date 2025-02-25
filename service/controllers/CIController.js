exports.processCIData = async (req, res) => {
    try {
        const ciData = req.body;
        
        // Segregate components by type
        const segregatedData = {
            security: [], // Firewalls
            loadBalancers: [],
            servers: [],
            applications: [],
            databases: []
        };

        // Helper function to check if item already exists in array
        const isUnique = (arr, item) => !arr.some(x => x.value === item.value);

        ciData.forEach(relation => {
            // Process parent nodes
            if (relation.parent.name.includes('Firewall') && isUnique(segregatedData.security, relation.parent)) {
                segregatedData.security.push(relation.parent);
            }
            else if (relation.parent.name.includes('Load balancer') && isUnique(segregatedData.loadBalancers, relation.parent)) {
                segregatedData.loadBalancers.push(relation.parent);
            }
            else if (relation.parent.name.includes('Server') && isUnique(segregatedData.servers, relation.parent)) {
                segregatedData.servers.push(relation.parent);
            }
            else if (relation.parent.name.includes('Application') && !relation.parent.name.includes('Server') && isUnique(segregatedData.applications, relation.parent)) {
                segregatedData.applications.push(relation.parent);
            }

            // Process child nodes
            if (relation.child.name.includes('Firewall') && isUnique(segregatedData.security, relation.child)) {
                segregatedData.security.push(relation.child);
            }
            else if (relation.child.name.includes('Load balancer') && isUnique(segregatedData.loadBalancers, relation.child)) {
                segregatedData.loadBalancers.push(relation.child);
            }
            else if (relation.child.name.includes('Server') && isUnique(segregatedData.servers, relation.child)) {
                segregatedData.servers.push(relation.child);
            }
            else if (relation.child.name.includes('Application') && !relation.child.name.includes('Server') && isUnique(segregatedData.applications, relation.child)) {
                segregatedData.applications.push(relation.child);
            }
            else if (relation.child.name.includes('DB') && isUnique(segregatedData.databases, relation.child)) {
                segregatedData.databases.push(relation.child);
            }
        });

        // Create hierarchy structure with unique identifiers
        const hierarchy = {
            level1: {
                security: segregatedData.security,
                loadBalancers: segregatedData.loadBalancers
            },
            level2: {
                servers: segregatedData.servers
            },
            level3: {
                applications: segregatedData.applications
            },
            level4: {
                databases: segregatedData.databases
            }
        };

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