const fs = require("fs");

const peripherals_constructors = {
  accelerometer: {
    constructor: {
      parameters: [
        {
          name: "i2c",
          dataType: "Object",
          default: null,
          optional: true,
          purpose: "I2C bus instance used to communicate with the sensor",
        },
        {
          name: "addr",
          dataType: "Number",
          default: 104,
          prefix: "hex",
          range: {
            min: 0,
            max: 127,
          },
          purpose: "I2C address of the MPU6050 sensor (default is 0x68)",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Simulated data (random values)",
            false: "Real hardware readings",
          },
          purpose: "Enables simulation mode if set to true",
        },
      ],
    },
  },
  dht_sensor: {
    constructor: {
      purpose:
        "Initializes the DHT sensor (DHT11 or DHT22) with the specified GPIO pin, sensor type, and simulation mode.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          purpose: "GPIO pin number connected to the DHT sensor",
        },
        {
          name: "sensor_type",
          dataType: "String",
          default: "DHT22",
          allowedValues: ["DHT11", "DHT22"],
          purpose: "Specifies the type of DHT sensor being used",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Sensor data will be simulated using random values",
            false: "Sensor will read actual values via GPIO",
          },
          purpose:
            "Controls whether the sensor operates in simulation or real mode",
        },
      ],
      returns: {
        dataType: "Object",
        class: "DHTSensor",
        purpose:
          "An instance of the DHTSensor class ready for measuring temperature and humidity",
      },
    },
  },
  encoder: {
    constructor: {
      purpose:
        "Initializes the rotary encoder with two pins. Supports simulation or real hardware interrupts for position tracking.",
      parameters: [
        {
          name: "pin_a",
          dataType: "Number",
          purpose: "GPIO pin connected to encoder channel A",
        },
        {
          name: "pin_b",
          dataType: "Number",
          purpose: "GPIO pin connected to encoder channel B",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Enables simulation mode, position can be changed manually",
            false: "Enables real hardware mode using interrupts on GPIO pins",
          },
          purpose:
            "Controls whether the encoder operates in simulation or real mode",
        },
      ],
      returns: {
        dataType: "Object",
        class: "Encoder",
        purpose:
          "An instance of the Encoder class used to track rotary position",
      },
    },
  },
  gas_sensor: {
    constructor: {
      purpose:
        "Initializes the gas sensor, either in simulation mode or using a real analog/digital input pin.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          purpose: "GPIO pin number to which the gas sensor is connected",
        },
        {
          name: "analog",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Uses analog pin and ADC to read varying gas levels",
            false: "Uses digital pin to detect gas presence (binary value)",
          },
          purpose: "Determines if the sensor is analog or digital",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Sensor values are simulated randomly",
            false: "Reads actual values from the connected hardware",
          },
          purpose:
            "Controls whether the sensor operates in simulation or real mode",
        },
      ],
      returns: {
        dataType: "Object",
        class: "GasSensor",
        purpose:
          "An instance of the GasSensor class ready for reading gas levels",
      },
    },
  },
  led: {
    constructor: {
      purpose:
        "Initializes the LED object to control a digital output pin, either in simulation or hardware mode.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          purpose: "GPIO pin number connected to the LED",
        },
        {
          name: "active_high",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "LED turns ON when the GPIO pin is set HIGH",
            false: "LED turns ON when the GPIO pin is set LOW",
          },
          purpose: "Controls whether the LED is active-high or active-low",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Simulated LED behavior (no real hardware interaction)",
            false: "Real LED control via hardware GPIO",
          },
          purpose: "Enables or disables simulation mode",
        },
      ],
      returns: {
        dataType: "Object",
        class: "LED",
        purpose:
          "An instance of the LED class ready for digital output control",
      },
    },
  },
  internal_led: {
    constructor: {
      purpose:
        "Initializes the internal LED, typically connected to GPIO2 on ESP32 boards. Inherits behavior from the LED base class.",
      parameters: [
        {
          name: "simulate",
          dataType: "Boolean",
          default: false,
          values_meaning: {
            true: "LED behavior will be simulated with print statements instead of real hardware interaction",
            false: "Controls the actual onboard LED",
          },
          purpose:
            "Determines whether the internal LED runs in simulation mode or hardware mode",
        },
      ],
      inherits_from: "LED",
      inherited_parameters: [
        {
          name: "pin",
          dataType: "Number",
          default: 2,
          purpose:
            "GPIO pin number for the internal LED (fixed to 2 for ESP32)",
        },
        {
          name: "active_high",
          dataType: "Boolean",
          default: true,
          purpose: "Indicates if the LED turns on with a HIGH signal",
        },
      ],
      returns: {
        dataType: "Object",
        class: "InternalLED",
        purpose: "An instance of InternalLED, ready to be turned on or off",
      },
    },
  },
  motion_sensor: {
    constructor: {
      purpose:
        "Initializes the motion sensor for detecting motion either in simulation mode or using a real GPIO pin.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          purpose: "GPIO pin number connected to the motion sensor",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Sensor data will be simulated (random motion values)",
            false: "Reads actual motion detection data from the connected pin",
          },
          purpose: "Whether to operate in simulation mode or real mode",
        },
      ],
      returns: {
        dataType: "Object",
        class: "MotionSensor",
        purpose:
          "An instance of the MotionSensor class ready for detecting motion",
      },
    },
  },
  push_button: {
    constructor: {
      purpose:
        "Initializes a push button instance, optionally in simulation mode, with support for debounce handling.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          purpose: "GPIO pin number connected to the push button",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Button state is simulated",
            false: "Button state is read from the physical hardware pin",
          },
          purpose: "Specifies whether the button is in simulation mode",
        },
        {
          name: "debounce_ms",
          dataType: "Number",
          default: 50,
          unit: "ms",
          range: {
            min: 0,
            max: 1000,
          },
          purpose: "Debounce duration to prevent false multiple button presses",
        },
      ],
      returns: {
        dataType: "Object",
        class: "PushButton",
        purpose:
          "An instance of the PushButton class ready for state reading and event handling",
      },
    },
  },
  relay: {
    constructor: {
      purpose:
        "Initializes the Relay, sets up control pin behavior and simulation mode.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          required: true,
          purpose: "GPIO pin number connected to the relay control input",
        },
        {
          name: "active_high",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Relay is activated when the pin is set to HIGH",
            false: "Relay is activated when the pin is set to LOW",
          },
          purpose: "Determines the logic level that activates the relay",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Relay behavior is simulated with console output",
            false: "Relay controls actual GPIO pin",
          },
          purpose:
            "Controls whether the relay operates in simulation or real mode",
        },
      ],
      returns: {
        dataType: "Object",
        class: "Relay",
        purpose:
          "An instance of the Relay class ready to control relay operations",
      },
    },
  },
  servo_motor: {
    constructor: {
      purpose:
        "Initializes a Servo motor by setting up the PWM configuration for angle control.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          purpose: "GPIO pin number connected to the Servo motor",
        },
        {
          name: "freq",
          dataType: "Number",
          default: 50,
          range: {
            min: 1,
            max: 1000,
          },
          unit: "Hz",
          purpose:
            "PWM frequency for the servo control signal (default is 50Hz)",
        },
        {
          name: "min_us",
          dataType: "Number",
          default: 500,
          range: {
            min: 0,
            max: 2000,
          },
          unit: "μs",
          purpose:
            "Minimum pulse width in microseconds, corresponding to 0° angle",
        },
        {
          name: "max_us",
          dataType: "Number",
          default: 2500,
          range: {
            min: 2000,
            max: 5000,
          },
          unit: "μs",
          purpose:
            "Maximum pulse width in microseconds, corresponding to max angle",
        },
        {
          name: "angle_range",
          dataType: "Number",
          default: 180,
          range: {
            min: 0,
            max: 360,
          },
          unit: "°",
          purpose: "Range of servo motion in degrees",
        },
      ],
      returns: {
        dataType: "Object",
        class: "Servo",
        purpose:
          "An instance of the Servo class ready to control the motor angle",
      },
    },
  },
  slide_switch: {
    constructor: {
      purpose:
        "Initializes the SlideSwitch on the given GPIO pin. Can operate in real or simulated mode.",
      parameters: [
        {
          name: "pin",
          dataType: "Number",
          purpose: "GPIO pin number to which the slide switch is connected",
        },
        {
          name: "simulate",
          dataType: "Boolean",
          default: true,
          values_meaning: {
            true: "Simulated mode enabled; state changes can be simulated programmatically",
            false: "Reads the actual hardware state of the slide switch",
          },
          purpose:
            "Determines whether the switch operates in simulation or real hardware mode",
        },
      ],
      returns: {
        dataType: "Object",
        class: "SlideSwitch",
        purpose: "An instance of the SlideSwitch class ready for use",
      },
    },
  },
};

const peripherals_info = JSON.parse(fs.readFileSync("peripherals_info.json"));

// console.log(peripherals_info);

peripherals_info.forEach((element) => {
  element.constructor = peripherals_constructors[element.name].constructor;
});

// console.log(JSON.stringify(peripherals_info, null, 2));

fs.writeFileSync(
  "peripherals_info_updated.json",
  JSON.stringify(peripherals_info, null, 2)
);
