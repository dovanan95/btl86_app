//query string sample
const query_private_message = {
    "selector":{
        "$or":[
            {"sender": 'DVA', "receiver": 'LTA'},
            {"sender": 'LTA', "receiver": 'DVA'}
        ],
        "timestamp": {"$gt": null}
    },
    "sort":[{"timestamp":"desc"}],
    "limit": 100,
    "skip":0,
    "use_index": ["_design/indexPrivMessDoc", "indexPrivMess"]
}

const query_room_message = {
    "selector":{"room_ID": "xxx"},
    "sort":[{"timestamp": "desc"}],
    "limit": 100,
    "skip": 0
}

const query_authen={
    "selector":{"userID":"xxx", "password":"yyy"}
}