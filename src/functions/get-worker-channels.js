exports.handler = function(context, event, callback) {
    const response = new Twilio.Response();

    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

    let client = context.getTwilioClient();
    if (event.WorkerSid === 'undefined') {
        response.body = 'no worker specified';
        console.log(response.body);
        callback(null, response);
    }

    // grab the worker channels
    client
        .taskrouter
        .workspaces(context.TWILIO_WORKSPACE_SID)
        .workers(event.WorkerSid)
        .workerChannels
        .list()
        .then(result => {
            response.body = result;
            console.log(response.body);
            callback(null, response);
          })
        .catch(error => {
            console.log(error);
            callback(error);
        });
};
