
let nutrientLayout = null;
let nutrientAdjustForm = null;

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
    
    nutrientLayout.events.on("BeforeShow", function (name, value) {
        nutrientAdjustForm.getItem("CONFIG:NUTRIENTS:RES_CAPACITY").setValue(getResCapacity());
    });    

    nutrientAdjustForm.events.on("Change", function (name, value) {
        updateDosingGrid();
    });    
    nutrientLayout.cell("dosing_adjust_container").attach(nutrientAdjustForm);

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
    };
    nutrientLayout.cell("base_nutrients_container").attach(baseNutrientsGrid);
    baseNutrientsGrid.data.events.on("Change", function (id, status, row) {
        if (status) {
            socket.emit(('BASE_NUTRIENTS:' + status).toUpperCase(), row);
        }
        updateDosingGrid();
    });
    baseNutrientsGrid.data.load('/json/nutrients/dosing.json').then(function () {
        updateDosingGrid();
    });

    nutrientLayout.cell("dosing_amount_container").attach(dosingGrid);
    
    if (navSelected == 'dosing') {
        layout.cell("content_container").attach(nutrientLayout);
    }
}