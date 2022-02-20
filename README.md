Communication Application on Hyperledger Fabric Blockchain platform

Setup:
1. Setup Hyperledger Fabric as in this link: https://hyperledger-fabric.readthedocs.io/en/latest/install.html
2. Replace javascript folder in <your_directory>fabric-samples/tree/main/chaincode/fabcar by our javascript folder in our repo
3. Replace file deployCC.sh in <your_directory>fabric-samples/tree/main/test-network/scripts by file deployCC.sh in our repo
4. Change directory to  <your_directory>fabric-samples/tree/main/test-network/scripts and execute command: "chmod +x deployCC.sh"
5. Change directory to <your_directory>fabric-samples/tree/main/test-network and execute command below:

###__Build_Project__### <br />
cd ../fabcar <br />
./networkDown.sh
cd ../test-network
./network.sh down
./network.sh up createChannel -ca -s couchdb
cd addOrg3/
./addOrg3.sh up -c mychannel -ca -s couchdb
cd ..
./network.sh deployCC -ccn fabcar -ccv 1 -cci initLedger -ccl javascript  -ccp ../chaincode/fabcar/javascript/
cd ../fabcar/javascript/
node enrollAdmin.js
node registerUser.js
npm install
npm install express
npm install multer
npm install ejs
docker update --restart unless-stopped $(docker ps -q)
###_End_###

Open Browser, access localhost:8082
