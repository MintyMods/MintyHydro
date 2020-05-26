const hydroData = {
    seedling: {
        temperature: {
            water: {
                min: 18.0,
                max: 26.0,
                rec: 22.0,
            },
            air: {
                min: 20.0,
                max: 30.0,
                rec: 24.0
            }
        },
        ph: {
            min: 6.0,
            max: 6.5,
            rec: 6.2,
        },
        ec: {
            min: 400.0,
            max: 1000.0,
            rec: 800.00,
        },
        humidity: {
            min: 60.0,
            max: 70.0,
            rec: 65.0,
        }
    },

    vegetation: {
        temperature: {
            water: {
                min: 18.0,
                max: 26.0,
                rec: 22.0,
            },
            air: {
                min: 20.0,
                max: 30.0,
                rec: 24.0
            }
        },
        ph: {
            min: 6.0,
            max: 6.5,
            rec: 6.2,
        },
        ec: {
            min: 400.0,
            max: 1000.0,
            rec: 800.00,
        },
        humidity: {
            min: 60.0,
            max: 70.0,
            rec: 65.0,
        }
    },

    flower: {
        temperature: {
            water: {
                min: 18.0,
                max: 26.0,
                rec: 22.0,
            },
            air: {
                min: 20.0,
                max: 30.0,
                rec: 24.0
            },
            ph: {
                min: 5.3,
                max: 5.9,
                rec: 5.5,
            },
            ec: {
                min: 400.0,
                max: 1000.0,
                rec: 800.00,
            },
            humidity: {
                min: 40.0,
                max: 55.0,
                rec: 45.0,
            }
        }
    },
}

let current = hydroData.seedling;


const HydroTarget = {
    current: hydroData.seedling,

    getMinAirTemp: function () {
        return current.temperature.air.min;
    },

    getMaxAirTemp: function () {
        return current.temperature.air.max;
    },

    getRecAirTemp: function () {
        return current.temperature.air.rec;
    },

    getMinWaterTemp: function () {
        return current.temperature.water.min;
    },

    getMaxWaterTemp: function () {
        return current.temperature.water.max;
    },

    getRecWaterTemp: function () {
        return current.temperature.water.rec;
    },

    getMinHumidity: function () {
        return current.humidity.min;
    },

    getMaxHumidity: function () {
        return current.humidity.max;
    },

    getRecHumidity: function () {
        return current.humidity.rec;
    },

    getMinPH: function () {
        return current.ph.min;
    },

    getMaxPH: function () {
        return current.ph.max;
    },

    getRecPH: function () {
        return current.ph.rec;
    },

    getMinEC: function () {
        return current.ec.min;
    },

    getMaxEC: function () {
        return current.ec.max;
    },

    getRecEC: function () {
        return current.ec.rec;
    }
};

module.exports = HydroTarget;
