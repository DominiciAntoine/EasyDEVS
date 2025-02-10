const diagramExample = {
    "models": [
        {
            "id": "switch_kitchen",
            "type": "atomic",
            "ports": {
                "out": ["signal"]
            }
        },
        {
            "id": "switch_bedroom",
            "type": "atomic",
            "ports": {
                "out": ["signal"]
            }
        },
        {
            "id": "light_kitchen_1",
            "type": "atomic",
            "ports": {
                "in": ["switch_signal"]
            }
        },
        {
            "id": "light_kitchen_2",
            "type": "atomic",
            "ports": {
                "in": ["switch_signal"]
            }
        },
        {
            "id": "light_bedroom",
            "type": "atomic",
            "ports": {
                "in": ["switch_signal"]
            }
        },
        {
            "id": "coupled_kitchen",
            "type": "coupled",
            "components": ["light_kitchen_1", "light_kitchen_2"]
        }
    ],
    "connections": [
        {
            "from": {
                "model": "switch_kitchen",
                "port": "signal"
            },
            "to": {
                "model": "light_kitchen_1",
                "port": "switch_signal"
            }
        },
        {
            "from": {
                "model": "switch_kitchen",
                "port": "signal"
            },
            "to": {
                "model": "light_kitchen_2",
                "port": "switch_signal"
            }
        },
        {
            "from": {
                "model": "switch_bedroom",
                "port": "signal"
            },
            "to": {
                "model": "light_bedroom",
                "port": "switch_signal"
            }
        }
    ]
};

module.exports = { diagramExample }