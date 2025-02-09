const diagramExample = {
    models: [
        {
            id: "switch_kitchen",
            type: "atomic",
            name: "Kitchen_Switch",
            ports: {
                out: ["signal"]
            }
        },
        {
            id: "switch_bedroom",
            type: "atomic",
            name: "Bedroom_Switch",
            ports: {
                out: ["signal"]
            }
        },
        {
            id: "light_kitchen_1",
            type: "atomic",
            name: "Kitchen_Light_1",
            ports: {
                in: ["switch_signal"]
            }
        },
        {
            id: "light_kitchen_2",
            type: "atomic",
            name: "Kitchen_Light_2",
            ports: {
                in: ["switch_signal"]
            }
        },
        {
            id: "light_bedroom",
            type: "atomic",
            name: "Bedroom_Light",
            ports: {
                in: ["switch_signal"]
            }
        },
        {
            id: "coupled_kitchen",
            type: "coupled",
            name: "Kitchen_Lights",
            components: ["light_kitchen_1", "light_kitchen_2"],
            ports: {
                external_in: ["switch_input"]
            }
        }
    ],
    connections: [
        {
            from: {
                model: "switch_kitchen",
                port: "signal"
            },
            to: {
                model: "light_kitchen_1",
                port: "switch_signal"
            }
        },
        {
            from: {
                model: "switch_kitchen",
                port: "signal"
            },
            to: {
                model: "light_kitchen_2",
                port: "switch_signal"
            }
        },
        {
            from: {
                model: "switch_bedroom",
                port: "signal"
            },
            to: {
                model: "light_bedroom",
                port: "switch_signal"
            }
        }
    ]
};

module.exports = { diagramExample }