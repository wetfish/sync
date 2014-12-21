// Required modules
var async = require('async');
var redis = require('redis');
var mysql = require('mysql');

// Redis connection model
var model =
{
    // Database connection variables
    redis: false,
    mysql: false,

    // Function to connect to our databases
    connect: function(config)
    {
        model.redis = redis.createClient(6333);
        model.mysql = mysql.createConnection(
        {
            host     : 'localhost',
            user     : config.mysql.username,
            password : config.mysql.password,
            database : config.mysql.database,
            timezone : 'utc' 
        });

        model.mysql.connect();
    },
    
    // Crazy function for generating functions to pass callbacks to async
    async: function(scope, func, args)
    {
        return function()
        {
            var callback, last = arguments.length - 1;
            
            for(var i = last; i >= 0; i--)
            {
                // The last argument should always be a callback
                if(i == last)
                    callback = arguments[i];

                // If there are any remaining arguments
                else
                    args.push(arguments[i]);
            }

            args.push(function(error, response) { callback(error, response); });
            func.apply(scope, args);
        }
    },

    where: function(select, glue)
    {
        if(typeof glue == "undefined")
            glue = " and ";

        var where = [];
        var values = [];
        
        for(var i = 0, keys = Object.keys(select), l = keys.length; i < l; i++)
        {
            where.push(model.mysql.escapeId(keys[i]) + ' = ?');
            values.push(select[keys[i]]);
        }

        return {where: where.join(glue), values: values};
    },

    secure_compare: function(str1, str2)
    {
        if(typeof str1 != "string" || typeof str2 != "string")
            throw "Error: Must compare two strings";

        str1 = str1.split('');
        str2 = str2.split('');

        var length = (str1.length > str2.length) ? str1.length : str2.length;
        var equal = true;

        for(var i = 0; i < length; i++)
        {
            if(typeof(str1[i]) == "undefined")
                equal = false;

            else if(typeof(str2[i]) == "undefined")
                equal = false;

            else if(str1[i] != str2[i])
                equal = false;
        }

        return equal;
    },

    user:
    {
        login: function(data, callback)
        {
            model.mysql.query("Insert into `users` set ?", data, function(error, response)
            {
                // Return logged in user's data
                var what = model.mysql.query("Select * from `users` where `fish_id` = ?", data.fish_id, callback);
            });
        }
    },

    channel:
    {
        create: function(data, callback)
        {
            model.mysql.query("Insert into `channels` set ?", data, callback);
        },

        list: function(callback)
        {
            model.mysql.query("Select * from `channels`", callback);
        },
    }
};

module.exports = model;
