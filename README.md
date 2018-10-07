# Distributed NodeJs
### Starting servers
1. first start the bootstrap server (boot.js)
    * ``port`` (default is 3000)
    
2. then start any number of servers (server.js)
    * ``bs`` (port of the bootstrap server)
    * ``port`` (default is 4000)
    * ``name`` (default is node_{port - 4000})
    
### CLI
1. for bootstrap server
    * ``at`` - print the address table
2. for normal servers
    * ``at`` - print the address table
    * ``name`` - print the name
    * ``send-msg`` - send a message to a node by name
        * ``target`` - target node name
        * ``msg`` - message you want to send
        * ``ttl`` - number of hops want to check
     * ``send-msg-rel`` - send a message reliably*
        * (same as above)
     * ``con-graph`` - draw the connectivity graph
        * ``ttl`` - number of hops want to check
        * http://graphonline.ru/en/create_graph_by_matrix
        * past the cli output in to this url as text format

### run.sh
* Help to create servers.
* If not execute use ``chmod +x run.sh && ./run.sh``
