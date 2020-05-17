let nutrientLayout = null;

function initNutrientSection() {
    nutrientLayout = new dhx.Layout(null, {
        rows: [
            { height: "300px", gravity: false, padding: 5, headerIcon: "fal fa-seedling", id: "dosing_amount_container", header: "Nutrient Dose : Base Nutrients x Total Capacity" },
            { height: "300px", gravity: false, padding: 5, headerIcon: "fal fa-balance-scale", id: "base_nutrients_container", header: "Base Nutrients @ ml amount per litre" },
            { height: "100px", gravity: false, padding: 5, id: "dosing_adjust_container" }
        ]
    });

    const gridColumns = loadJSON('/json/nutrients/headers.json');
    const baseNutrientsGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: true,
        sortable: true,
        resizable: false,
        splitAt: (isCompact() ? 0 : 1),
    });
    const dosingGrid = new dhx.Grid(null, {
        columns: gridColumns,
        autoWidth: false,
        editable: false,
        sortable: false,
        resizable: false,
        splitAt:  (isCompact() ? 0 : 1)
    });

    nutrientAdjustForm = new dhx.Form(null,  loadJSON('/json/nutrients/adjust.json'));
    
    initFormEvents(nutrientAdjustForm, 'NUTRIENT');
    nutrientLayout.cell("dosing_adjust_container").attach(nutrientAdjustForm);
    nutrientLayout.cell("base_nutrients_container").attach(baseNutrientsGrid);
    nutrientLayout.cell("dosing_amount_container").attach(dosingGrid);

    const updateDosingGrid = function () {
        let base = baseNutrientsGrid.data.serialize();
        let capacity = getOverRideResCapacity();
        dosingGrid.data.removeAll();
        for (let i = 0; i < base.length; i++) {
            let keys = Object.keys(base[i]);
            for (let j = 0; j < keys.length; j++) {
                let key = keys[j];
                let cell = base[i][key];
                if (j > 0) {
                    base[i][j] = ((parseFloat(base[i][j]) * parseFloat(capacity))).toFixed(2);
                }
            }
            dosingGrid.data.add(base[i]);
        }
        baseNutrientsGrid.paint();
        dosingGrid.paint();
    };

    baseNutrientsGrid.data.events.on("Change", function (id, status, row) {
        if (status) {
            let opts = { 'command':'JSON:SET', 'table':'NUTRIENT', 'name':id, 'json':row, status };
            socket.emit("DB:COMMAND", opts);
            updateDosingGrid();
        }
    });

    baseNutrientsGrid.data.load('/json/nutrients/dosing.json').then(function () {
        updateDosingGrid();
    });

    socket.on('DB:JSON', function (data) {
        if (data.table == 'NUTRIENT' && data.command == 'JSON:ALL') {   
            var rows = data.json;
            rows.forEach(element => {
                let cols = JSON.parse(element.value);
                if (cols.id) {
                    let keys = Object.keys(cols);
                    for (let i = 0; i < keys.length; i++) {
                        baseNutrientsGrid.data.getItem(cols.id)[keys[i]] = cols[keys[i]];
                    }
                    updateDosingGrid();
                    
                }
            });
        } 
    });
    socket.emit("DB:COMMAND", { 'command':'JSON:ALL', 'table':'NUTRIENT' });
    nutrientAdjustForm.events.on("Change", updateDosingGrid);
}

function getOverRideResCapacity () {
    if (nutrientAdjustForm) {
        return nutrientAdjustForm.getItem('NUTRIENT:RES_CAPACITY').getValue();
    }
    return getResCapacity();
}

