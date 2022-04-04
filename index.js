const express = require('express')
const app = express()
const dfff = require('dialogflow-fulfillment')
const axios = require('axios');
const {WebhookClient,Card, Suggestion, Image} = require('dialogflow-fulfillment');
const e = require('express');

app.get('/',(req,res)=> {
    res.send('We are live')
})


app.post('/',express.json(),(req,res) => {
    const agent = new WebhookClient({
        request:req,
        response: res
    })

    function handleRecipe(agent) {
        return new Promise((resolve,reject) => {
            var url = 'https://api.spoonacular.com/recipes/complexSearch?apiKey=0e9475c031384f63aa1a4dae5975b4e8&query='+ agent.parameters.dish  +'&number=1';
            return axios.get(url).then(function (response) {
            var id = response.data.results[0].id;
            var card_url = 'https://api.spoonacular.com/recipes/'+id+'/card?apiKey=0e9475c031384f63aa1a4dae5975b4e8';
            axios.get(card_url).then(res => {
                var image_url = res.data.url.toString();
                agent.add('Here is your recipe 😀')
                agent.add(new Image(image_url));
                agent.add('Do you want to search another dish?')
                resolve();
            }).catch(err=>console.log(err));

            })
            .catch(function (error) {
            console.log(error);
            });
        })
    //    agent.add('Do you want to search another dish?')
    }

    function handleRecipeFollowUpYes(agent) {
        agent.add('Sure!')
        agent.setFollowupEvent('search_dish')
    
    }

    function handleRecipeFollowUpNo(agent) {
        agent.add('Okay!')
        agent.setFollowupEvent({
            "name": "greet_name",
            "parameters": {
              "person": agent.getContext('name-followup').parameters.person,
            },
            "languageCode": "en-US"
          })
        
    }
    function handleDishCalories(agent) {
        return new Promise((resolve,reject) => {
                var url = 'https://api.spoonacular.com/recipes/findByNutrients?apiKey=0e9475c031384f63aa1a4dae5975b4e8&minCalories='+ agent.parameters.calories1  +'&maxCalories=' + agent.parameters.calories2 + '&random=true&number=2';
                return axios.get(url).then(function (response) {
                agent.add('Here are a few dish suggestions for you....😉')
                response.data.map( ele => {
                    agent.add(new Card({
                        title: '-*-*- ' + ele.title + '-*-*-',
                        imageUrl: ele.image,
                        text: 'Calories: '+ ele.calories + '\nProtein: '+ ele.protein + '\nCarbohydrates: '+ ele.carbs + '\nFat: '+ ele.fat
                    }))
                })
                agent.add('Do you want to see more suggestions?')
                resolve()
                })
                .catch(function (error) {
                console.log(error);
                });
            })
        // agent.add('Do you want to see more suggestions?')
    }
    
    function handleDishCaloriesYes(agent) {
        agent.add('You said yes.')
        agent.setFollowupEvent({
            "name": "calories_range_event",
            "parameters": {
              "calories1": agent.getContext('caloriesrange-followup').parameters.calories1,
              "calories2": agent.getContext('caloriesrange-followup').parameters.calories2,
              "person": agent.getContext('caloriesrange-followup').parameters.person,
            },
            "languageCode": "en-US"
          })
    }

    function handleDishCaloriesNo(agent) {
        agent.add('Okay!')
        agent.setFollowupEvent({
            "name": "greet_name",
            "parameters": {
              "person": agent.getContext('name-followup').parameters.person,
            },
            "languageCode": "en-US"
          })
    }
    var intentMap = new Map();
    intentMap.set('search dish',handleRecipe)
    intentMap.set('search dish - yes',handleRecipeFollowUpYes)
    intentMap.set('search dish - no',handleRecipeFollowUpNo)
    intentMap.set('calories range',handleDishCalories)
    intentMap.set('calories range - yes',handleDishCaloriesYes)
    intentMap.set('calories range - no',handleDishCaloriesNo)

    agent.handleRequest(intentMap);
})

app.listen(3333, () => console.log("server is live at 3333"))