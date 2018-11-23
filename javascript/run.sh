#!/usr/bin/env bash
DIR=/home/malaka/projects/dst/


# ========= start the bootstrap server
gnome-terminal --working-directory=${DIR}/BootstrapServer/C/Linux/ -e './a.out 5050'
echo " - bootstrap server started..."
sleep 5
# =========


gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_000 --port=4000'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_001 --port=4010'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_002 --port=4020'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_003 --port=4030'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_004 --port=4040'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_005 --port=4050'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_006 --port=4060'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_007 --port=4070'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_008 --port=4070'
gnome-terminal --working-directory=${DIR}/javascript/ \
        --tab -e 'node server.js --bsPort=5050 --bsIP=127.0.0.1 --name=node_009 --port=4070'

#        --tab -e 'node server.js --port=4001 --bs=3000' \
#        --tab -e 'node server.js --port=4002 --bs=3000' \
#        --tab -e 'node server.js --port=4003 --bs=3000' \
#        --tab -e 'node server.js --port=4004 --bs=3000' \
#        --tab -e 'node server.js --port=4005 --bs=3000' \
#        --tab -e 'node server.js --port=4006 --bs=3000' \
#        --tab -e 'node server.js --port=4007 --bs=3000' \
#        --tab -e 'node server.js --port=4008 --bs=3000' \
#        --tab -e 'node server.js --port=4009 --bs=3000'
#        --tab -e 'node server.js --port=4010 --bs=3000' \
#        --tab -e 'node server.js --port=4011 --bs=3000' \
#        --tab -e 'node server.js --port=4012 --bs=3000' \
#        --tab -e 'node server.js --port=4013 --bs=3000' \
#        --tab -e 'node server.js --port=4014 --bs=3000' \
#        --tab -e 'node server.js --port=4015 --bs=3000' \
#        --tab -e 'node server.js --port=4016 --bs=3000' \
#        --tab -e 'node server.js --port=4017 --bs=3000' \
#        --tab -e 'node server.js --port=4018 --bs=3000'

#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4007 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4008 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4009 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4010 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4011 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4012 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4013 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4014 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4015 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4016 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4017 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4018 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4020 --bs=3000'
#sleep 1
#gnome-terminal --working-directory=${DIR} -e 'node server.js --port=4021 --bs=3000'
#sleep 1
