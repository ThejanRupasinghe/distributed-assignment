# Distributed NodeJs
### Starting servers
1. Start the bootstrap server inside ``BootstrapServer/C/Linux``
    * Compile ``gcc P2PRegistry.c``
    * Run ``./a.out <port_number>`` eg: ``./a.out 5050``
    
2. Start Node servers (server.js)
    * Command line arguments
        * ``bsIP`` - IP of the bootstrap server
        * ``bsPort`` - Port of the bootstrap server
        * ``name`` - name of the node in the format 'node_001'
        * ``port`` - server port
        * ``wire`` - enables wire logs
        * ``debug`` - enable debug logs
    * eg: ``node server.js --bsIP=127.0.0.1 --bsPort=5050 --name=node_001 --port=4000``
    * eg: wire log enabled ``node server.js --bsIP=127.0.0.1 --bsPort=5050 --name=node_001 --port=4000 --wire``
    
### CLI
* ``at`` - prints the address table
* ``name`` - prints the name
* ``files`` - prints the file list in the node
* ``exit`` - gracefully shuts down the node
* ``search "harry"`` - searches for a string
* ``download "Harry Potter" 192.168.1.6 4001`` - to download the given file from the given IP and Port
 * ``con-graph`` - draws the connectivity graph
    * ``ttl`` - number of hops want to check
    * http://graphonline.ru/en/create_graph_by_matrix
    * past the cli output in to this url as text format

### run.sh
* Help to create servers.
* Please make sure to edit the $DIR variable to your working dir.
* If not execute use ``chmod +x run.sh && ./run.sh``


