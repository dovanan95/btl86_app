#An Do, [21. 12. 15. AM 4:30]
../fabcar
./networkDown.sh
./network.sh down
./network.sh up createChannel -ca -s couchdb
cd addOrg3/
./addOrg3.sh up -c mychannel -s couchdb
cd ..
./network.sh deployCC -ccn fabcar -ccv 1 -cci initLedger -ccl javascript  -ccp ../chaincode/fabcar/javascript/