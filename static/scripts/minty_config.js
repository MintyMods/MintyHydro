const config = {
    calibration: {
        time: 1000,
        speed: 255
    },
    debug: true,
    defaults: {
        res: {
            capacity: 45
        }
    },
    slave:{
        url:'http://192.168.1.126/api'
    }
}

const HighLightRange = {        
    WATER_EC:{
        min:800,
        max:1600,
        rec: {
            min:1000,
            max:1400,
        }
    },
    WATER_PH:{
        min:5.5,
        max:6.5,
        rec: {
            min:5.7,
            max:6.3,
        }
    },
    WATER_TEMP:{
        min:18,
        max:26,
        rec:{
            min:22,
            max:24,
        }
    },
    AIR_TEMP:{
        min:20,
        max:30,
        rec:{
            min:22,
            max:26,
        }
    },
    AIR_HUMIDITY:{
        min:30,
        max:60,
        rec:{
            min:35,
            max:55,
        }
    }
}
