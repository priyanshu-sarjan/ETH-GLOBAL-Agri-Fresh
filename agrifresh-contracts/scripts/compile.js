const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compileContracts() {
    console.log('Compiling AgriFresh Smart Contracts...');
    const srcDir = path.join(__dirname, '..', 'src');
    const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.sol'));

    const sources = {};
    for (const file of files) {
        sources[file] = {
            content: fs.readFileSync(path.join(srcDir, file), 'utf8')
        };
    }

    const input = {
        language: 'Solidity',
        sources: sources,
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
                }
            }
        }
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        let hasError = false;
        output.errors.forEach(err => {
            if (err.severity === 'error') {
                console.error('Compilation ERROR:', err.formattedMessage);
                hasError = true;
            } else {
                console.warn('Compilation WARNING:', err.formattedMessage);
            }
        });
        if (hasError) {
            process.exit(1);
        }
    }

    const artifactsDir = path.join(__dirname, '..', 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const exportedArtifacts = {};

    for (const sourceName in output.contracts) {
        for (const contractName in output.contracts[sourceName]) {
            const contractData = output.contracts[sourceName][contractName];
            const artifact = {
                contractName,
                sourceName,
                abi: contractData.abi,
                bytecode: contractData.evm.bytecode.object,
                deployedBytecode: contractData.evm.deployedBytecode.object
            };
            const artifactFile = path.join(artifactsDir, `${contractName}.json`);
            fs.writeFileSync(artifactFile, JSON.stringify(artifact, null, 2));
            exportedArtifacts[contractName] = artifact;
            console.log(`✅ Compiled and saved artifact: ${contractName} -> ${artifactFile}`);
        }
    }

    return exportedArtifacts;
}

if (require.main === module) {
    compileContracts();
}

module.exports = { compileContracts };

