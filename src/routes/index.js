 const { Router } = require('express');
const router = Router();
//*________________________________________
const { Country, Activity } = require('../db')
//*________________________________________
// const axios = require('axios');
const API = require('./countries.json')


router.post('/create/country', async (req, res) => {
    const { key, name, flag, continent, capital, subregion, area, population } = req.body;
    try {
      let country =  await Country.create(
            {
                key: key,
                name: name,
                flag: flag,
                continent: continent,
                capital: capital,
                subregion: subregion,
                area: area,
                population: population
            }
        )
        res.json(country);
    } catch (error) {
        res.send(error)

    }

})



router.get('/countries/data', async function (req, res, next) {

  const create = await API.map(country => {
       Country.create(
           {
               key: country.alpha3Code,
               name: country.name,
               flag: `https://www.banderas-mundo.es/data/flags/w580/${country.alpha2Code.toLowerCase()}.png`,
               continent: country.region,
               capital: country.capital,
               subregion: country.subregion,
               area: country.area,
               population: country.population
           }
       )
   })
   res.send('Data base was created')
   
})




//*___GET_COUNTRIES_AND_?NAME=_____________________________________
router.get('/countries', async function (req, res, next) {
        try {
                let dataContries = await Country.findAll({
                    attributes: ['flag', 'name', 'continent', 'key', 'population'],
                })
                res.json(dataContries)
            
        } catch (err) {
            console.error(err);
        }
})

router.patch('/update/:countryKey', async(req, res) =>{
    const { countryKey } = req.params;
    const {  name, flag, continent, capital, subregion, area, population } = req.body;
    try {
     const result =    await Country.update({
        name: name,
        flag: flag,
        continent: continent,
        capital: capital,
        subregion: subregion,
        area: area,
        population: population
        },{
            where: {
                key: countryKey
            }
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
    
})

//*______GET_COUNTRIES_ID________________________________________________
router.get('/countries/:id', async (req, res) => {
    const { id } = req.params;
    const country = await Country.findByPk(id);
    const { key, name, continent, flag, capital, subregion, area, population } = country
    const obj = {
        key: key,
        name: name,
        continent: continent,
        flag: flag,
        capital: capital,
        subregion: subregion,
        area: area,
        population: population
    }

    res.json(obj || 'Country not found');
});

//*__POST_ACTIVITY________________________________________________________________
router.post('/activity', async (req, res) => {
    const { name, difficulty, duration, season } = req.body;
    try {
        let activity = await Activity.create({
            name: name,
            difficulty: difficulty,
            duration: duration,
            season: season
        });

        res.json(activity);
    } catch (error) {
        res.send(error);
    }
});


//?__GET_COUNTRIES_LIST____________________________________________
router.get('/countries/list', async function (req, res, next) {
    const { attribute, order } = req.query;
    let dataContries = await Country.findAll({
        attributes: ['flag', 'name', 'continent', 'key', 'population'],
        order: [
            //?name,population/ASC,DESC//   ...?attribute=population&order=DESC
            [attribute, order]
        ]
    })
    res.json(dataContries)
})

//?__GET_ACTIVITIES________________________________________________________
router.get('/activities', async (req, res) => {
    try {
        let dataActivities = await Activity.findAll({
            attributes: ['name', 'difficulty', 'duration', 'season']
        })
        res.json(dataActivities)
    } catch (error) {
        res.send(error)
    }
})


//?__POST_:ACTIVITY/:COUNTRY_________________________________________
router.post('/:activity/:country', async (req, res) => {
    const { country, activity } = req.params;

    try {
        let activityOne = await Activity.findOne({
            where: {
                name: activity,
            }
        })
        let countryOne = await Country.findOne({
            where: {
                name: country,
            }
        })
        activityOne.addCountry(countryOne);

        const result = {
            activity: activityOne.name,
            country: countryOne.name
        }
        res.send(result)

    } catch (error) {
        res.send(error)
    }
})

//?__GET_:COUNTRY_ACTIVITIES_________________________________________
router.get('/:countryKey/activities', async (req, res) => {
    try { //* Here search the country
        const { countryKey } = req.params;
        let countryOne = await Country.findOne({
            where: {
                key: countryKey
            }
        })
        //* Here search the activities
        let result = await countryOne.getActivities({ attributes: ['name', 'difficulty', 'duration', 'season'] })

        res.json(result)

    } catch (error) {
        res.json(error)
    }

})

//?__GET_:ACTIVITY_COUNTRIES________________________________________
router.get('/:activity/countries', async (req, res) => {
    try { //* Here search the activity
        const { activity } = req.params;
        let activityOne = await Activity.findOne({
            where: {
                name: activity
            }
        })
        //* Here search the countries
        let result = await activityOne.getCountries({ attributes: ['flag', 'name', 'continent', 'key', 'population'] })

        res.json(result)

    } catch (error) {
        res.json(error)
    }
})


//?__DELETE_:ACTIVITY____________________________________________________________________
router.delete('/delete/:activity', async(req, res) =>{
    try {
        const { activity } = req.params;
     await Activity.destroy({
        where: {
            name: activity
        }
    })
    
    res.send('Activity Deleted')
    } catch (error) {
        res.json(error)
    }
    
})

//?__DELETE_:COUNTRY____________________________________________________________________
router.delete('/delete/:activity/:country', async(req, res) =>{
    try {
        const { activity, country } = req.params;
        
        let activityOne = await Activity.findOne({
            where: {
                name: activity,
            }
        })
        let countryOne = await Country.findOne({
            where: {
                name: country,
            }
        })

        activityOne.removeCountries(countryOne);
    
    res.send('Country relation Deleted')
    } catch (error) {
        res.json(error)
    }
    
})


router.patch('/update/:activity', async(req, res) =>{
    const { activity } = req.params;
    const {  name, difficulty, duration, season } = req.body;
    try {
     const result =    await Activity.update({
             name: name,
            difficulty: difficulty,
            duration: duration,
            season: season
        },{
            where: {
                name: activity
            }
        })
        res.json(result)
    } catch (error) {
        res.json(error)
    }
    
})







module.exports = router;
