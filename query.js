//query string sample
const query_private_message = {
    "selector":{
        "$or":[
            {"sender": "xxx", "receiver": "yyy"},
            {"sender": "yyy", "sender": "xxx"}
        ]
    },
    "sort":[{"timestamp":"desc"}],
    "limit": 100,
    "skip":0
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