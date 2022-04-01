const express = require('express')
const app = express()
const dfff = require('dialogflow-fulfillment')
const axios = require('axios');
const {WebhookClient,Card, Suggestion, Image} = require('dialogflow-fulfillment');

app.get('/',(req,res)=> {
    res.send('We are live')
})


app.post('/',express.json(),(req,res) => {
    const agent = new WebhookClient({
        request:req,
        response: res
    })

    function handleDish(agent) {
        // return new Promise((resolve,reject) => {
        //     var url = 'https://api.spoonacular.com/recipes/complexSearch?apiKey=0e9475c031384f63aa1a4dae5975b4e8&query='+ agent.parameters.dish  +'&number=1';
        //     return axios.get(url).then(function (response) {
        //     var id = response.data.results[0].id;
        //     // var nutrition = 'This dish is of '+ response.data.results[0].calories+' calories that includes '+ response.data.results[0].carbs+' of carbohydrates '+response.data.results[0].fat+' of fat and '+ response.data.results[0].protein+' of proteins'
        //     // agent.add(nutrition)
        //     var card_url = 'https://api.spoonacular.com/recipes/'+id+'/card?apiKey=0e9475c031384f63aa1a4dae5975b4e8';
        //     axios.get(card_url).then(res => {
        //         var image_url = res.data.url.toString();
        //         agent.add('Here is your recipe 😀')
        //         agent.add(new Image(image_url));
        //         agent.add('Do you want to search another dish?')
        //         resolve();
        //     }).catch(err=>console.log(err));

        //     })
        //     .catch(function (error) {
        //     console.log(error);
        //     });
        // })
       agent.add('Do you want to search another dish?')
    }

    function handleDishFollowUpYes(agent) {
        agent.add('Sure!')
        agent.setFollowupEvent('search_dish')
    
    }

    function handleDishFollowUpNo(agent) {
        agent.add('Okay!')
        agent.setFollowupEvent('name')
    
    }
    var intentMap = new Map();
    intentMap.set('search dish',handleDish)
    intentMap.set('search dish - yes',handleDishFollowUpYes)
    intentMap.set('search dish - no',handleDishFollowUpNo)
    agent.handleRequest(intentMap);
})

app.listen(3333, () => console.log("server is live at 3333"))