#!/usr/bin/env bash
DIR=/home/malaka/projects/distributed/

# ========= start the bootstrap server
gnome-terminal --working-directory=${DIR} -e 'node boot.js --port=3000'
echo " - bootstrap server started..."
sleep 2
# =========


gnome-terminal --working-directory=${DIR} \
        --tab -e 'node server.js --port=4000 --bs=3000' \
        --tab -e 'node server.js --port=4001 --bs=3000' \
        --tab -e 'node server.js --port=4002 --bs=3000' \
        --tab -e 'node server.js --port=4003 --bs=3000' \
        --tab -e 'node server.js --port=4004 --bs=3000' \
        --tab -e 'node server.js --port=4005 --bs=3000' \
        --tab -e 'node server.js --port=4006 --bs=3000' \
        --tab -e 'node server.js --port=4007 --bs=3000' \
        --tab -e 'node server.js --port=4008 --bs=3000' \
        --tab -e 'node server.js --port=4009 --bs=3000' \
        --tab -e 'node server.js --port=4010 --bs=3000' \
        --tab -e 'node server.js --port=4011 --bs=3000' \
        --tab -e 'node server.js --port=4012 --bs=3000' \
        --tab -e 'node server.js --port=4013 --bs=3000' \
        --tab -e 'node server.js --port=4014 --bs=3000' \
        --tab -e 'node server.js --port=4015 --bs=3000' \
        --tab -e 'node server.js --port=4016 --bs=3000' \
        --tab -e 'node server.js --port=4017 --bs=3000' \
        --tab -e 'node server.js --port=4018 --bs=3000'

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
