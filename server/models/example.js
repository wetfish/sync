module.exports = function(model)
{
    model.example = function()
    {
        model.mysql.query("show databases", function(error, response)
        {
            console.log(error, response);
        });
    }
}
