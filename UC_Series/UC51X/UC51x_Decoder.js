/**
 * Payload Decoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product UC51x
 */
var RAW_VALUE = 0x01;

// Chirpstack v4
function decodeUplink(input) {
    var decoded = milesightDeviceDecode(input.bytes);
    return { data: decoded };
}

// Chirpstack v3
function Decode(fPort, bytes) {
    return milesightDeviceDecode(bytes);
}

// The Things Network
function Decoder(bytes, port) {
    return milesightDeviceDecode(bytes);
}

function milesightDeviceDecode(bytes) {
    var decoded = {};

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // TSL VERSION
        else if (channel_id === 0xff && channel_type === 0xff) {
            decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = readLoRaWANClass(bytes[i]);
            i += 1;
        }
        // RESET EVENT
        else if (channel_id === 0xff && channel_type === 0xfe) {
            decoded.reset_event = readResetEvent(1);
            i += 1;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = readDeviceStatus(1);
            i += 1;
        }
        // BATTERY
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = readUInt8(bytes[i]);
            i += 1;
        }
        // VALVE 1
        else if (channel_id === 0x03 && channel_type == 0x01) {
            var valve_value = readUInt8(bytes[i]);
            if (valve_value === 0xff) {
                decoded.valve_1_result = readDelayControlResult(1);
            } else {
                decoded.valve_1 = readValveStatus(valve_value);
            }
            i += 1;
        }
        // VALVE 2
        else if (channel_id === 0x05 && channel_type == 0x01) {
            var valve_value = readUInt8(bytes[i]);
            if (valve_value === 0xff) {
                decoded.valve_2_result = readDelayControlResult(1);
            } else {
                decoded.valve_2 = readValveStatus(valve_value);
            }
            i += 1;
        }
        // VALVE 1 Pulse
        else if (channel_id === 0x04 && channel_type === 0xc8) {
            decoded.valve_1_pulse = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // VALVE 2 Pulse
        else if (channel_id === 0x06 && channel_type === 0xc8) {
            decoded.valve_2_pulse = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // GPIO 1 (hardware_version >= v2.0 and firmware_version >= v2.4)
        else if (channel_id === 0x07 && channel_type == 0x01) {
            decoded.gpio_1 = readGpioStatus(bytes[i]);
            i += 1;
        }
        // GPIO 2 (hardware_version >= v2.0 and firmware_version >= v2.4)
        else if (channel_id === 0x08 && channel_type == 0x01) {
            decoded.gpio_2 = readGpioStatus(bytes[i]);
            i += 1;
        }
        // PRESSURE (hardware_version >= v4.0 and firmware_version >= v1.2)
        else if (channel_id === 0x09 && channel_type === 0x7b) {
            decoded.pressure = readUInt16LE(bytes.slice(i, i + 2));
            i += 2;
        }
        // PRESSURE FAILED (hardware_version >= v4.0 and firmware_version >= v1.2)
        else if (channel_id === 0xb9 && channel_type === 0x7b) {
            decoded.pressure_sensor_status = readSensorStatus(bytes[i]);
            i += 1;
        }
        // CUSTOM MESSAGE (hardware_version >= v4.0 and firmware_version >= v1.1)
        else if (channel_id === 0xff && channel_type === 0x12) {
            decoded.custom_message = readAscii(bytes.slice(i, bytes.length));
            i = bytes.length;
        }
        // HISTORY (hardware_version >= v3.0 and firmware_version >= v3.1)
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var value = bytes[i + 4];
            var status = readValveStatus(value & 0x01);
            var mode_value = (value >> 1) & 0x01;
            var mode = readValveMode(mode_value);
            var gpio = readGpioStatus((value >> 2) & 0x01);
            var index = ((value >> 4) & 0x01) === 0 ? 1 : 2;
            var pulse = readUInt32LE(bytes.slice(i + 5, i + 9));

            var data = { timestamp: timestamp, mode: mode };
            // GPIO mode
            if (mode_value === 0) {
                data["valve_" + index] = status;
                data["gpio_" + index] = gpio;
            }
            // Counter mode
            else if (mode_value === 1) {
                data["valve_" + index] = status;
                data["valve_" + index + "_pulse"] = pulse;
            }
            i += 9;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // HISTORY PIPE PRESSURE (hardware_version >= v4.0 & firmware_version >= v1.1)
        else if (channel_id === 0x21 && channel_type === 0xce) {
            var data = {};
            data.timestamp = readUInt32LE(bytes.slice(i, i + 4));
            data.pressure = readUInt16LE(bytes.slice(i + 4, i + 6));
            i += 6;

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // RULE ENGINE
        else if (channel_id === 0xfe && channel_type === 0x53) {
            var rule = {};
            rule.index = readUInt8(bytes[i]);
            rule.enabled = readEnableStatus(bytes[i + 1]);
            rule.condition = {};
            var condition = bytes[i + 2];
            switch (condition) {
                case 0x00:
                    rule.condition.type = readConditionType(condition);
                    break;
                case 0x01:
                    rule.condition.type = readConditionType(condition);
                    rule.condition.start_time = readUInt32LE(bytes.slice(i + 3, i + 7));
                    rule.condition.end_time = readUInt32LE(bytes.slice(i + 7, i + 11));
                    rule.condition.repeat_enabled = readEnableStatus(bytes[i + 11]);
                    var repeat_type = readUInt8(bytes[i + 12]);
                    rule.condition.repeat_type = readRepeatType(repeat_type);
                    var repeat_value = readUInt16LE(bytes.slice(i + 13, i + 15));
                    if (repeat_type === 2) {
                        var week_offset_map = { 0: "monday", 1: "tuesday", 2: "wednesday", 3: "thursday", 4: "friday", 5: "saturday", 6: "sunday" };
                        rule.condition.repeat_time = {};
                        for (var day in week_offset_map) {
                            rule.condition.repeat_time[week_offset_map[day]] = readEnableStatus((repeat_value >> day) & 0x01);
                        }
                    } else {
                        rule.condition.repeat_step = repeat_value;
                    }
                    break;
                case 0x02:
                    rule.condition.type = readConditionType(condition);
                    rule.condition.d2d_command = readD2DCommand(bytes.slice(i + 3, i + 5));
                    break;
                case 0x03:
                    rule.condition.type = readConditionType(condition);
                    rule.condition.valve_index = readUInt8(bytes[i + 3]);
                    rule.condition.duration_time = readUInt16LE(bytes.slice(i + 4, i + 6));
                    rule.condition.pulse_threshold = readUInt32LE(bytes.slice(i + 6, i + 10));
                    break;
                case 0x04:
                    rule.condition.type = readConditionType(condition);
                    rule.condition.valve_index = readUInt8(bytes[i + 3]);
                    rule.condition.pulse_threshold = readUInt32LE(bytes.slice(i + 4, i + 8));
                    break;
                default:
                    break;
            }
            i += 15;

            var action = bytes[i];
            rule.action = {};
            switch (action) {
                case 0x00:
                    rule.action.type = "none";
                    break;
                case 0x01:
                case 0x02:
                    rule.action.type = "valve_action";
                    rule.action.valve_index = readUInt8(bytes[i + 1]);
                    rule.action.valve_status = readValveStatus(bytes[i + 2]);
                    rule.action.time_enabled = readEnableStatus(bytes[i + 3]);
                    rule.action.duration_time = readUInt32LE(bytes.slice(i + 4, i + 8));
                    rule.action.pulse_enabled = readEnableStatus(bytes[i + 8]);
                    rule.action.pulse_threshold = readUInt32LE(bytes.slice(i + 9, i + 13));
                    break;
                case 0x03:
                    var type = bytes[i + 1];
                    if (type === 0x01) {
                        rule.action.type = "device_status_report";
                        rule.action.valve_index = 1;
                    } else if (type === 0x02) {
                        rule.action.type = "device_status_report";
                        rule.action.valve_index = 2;
                    } else if (type === 0x03) {
                        rule.action.type = "custom_message_report";
                        rule.action.text = readAscii(bytes.slice(i + 2, i + 10));
                    }
                    break;
                default:
                    break;
            }
            i += 13;

            decoded.rules = decoded.rules || [];
            decoded.rules.push(rule);
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readTslVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}

function readLoRaWANClass(type) {
    var class_map = {
        0: "Class A",
        1: "Class B",
        2: "Class C",
        3: "Class CtoB",
    };
    return getValue(class_map, type);
}

function readResetEvent(status) {
    var status_map = {
        0: "normal",
        1: "reset",
    };
    return getValue(status_map, status);
}

function readDeviceStatus(status) {
    var status_map = {
        0: "off",
        1: "on",
    };
    return getValue(status_map, status);
}

function readValveStatus(status) {
    var status_map = {
        0: "close",
        1: "open",
    };
    return getValue(status_map, status);
}

function readDelayControlResult(value) {
    var result_map = {
        0: "success",
        1: "failed",
    };
    return getValue(result_map, value);
}

function readSensorStatus(value) {
    var status_map = {
        1: "sensor error",
    };
    return getValue(status_map, value);
}

function readValveMode(value) {
    var mode_map = {
        0: "counter",
        1: "gpio",
    };
    return getValue(mode_map, value);
}

function readGpioStatus(status) {
    var status_map = {
        0: "off",
        1: "on",
    };
    return getValue(status_map, status);
}

function readEnableStatus(status) {
    var status_map = {
        0: "disable",
        1: "enable",
    };
    return getValue(status_map, status);
}

function readConditionType(type) {
    var type_map = {
        0: "none",
        1: "time condition",
        2: "d2d condition",
        3: "time and pulse threshold condition",
        4: "pulse threshold condition",
    };
    return getValue(type_map, type);
}

function readActionType(type) {
    var type_map = {
        0: "none",
        1: "valve action",
    };
    return getValue(type_map, type);
}

function readRepeatType(type) {
    var type_map = {
        0: "monthly",
        1: "daily",
        2: "weekly",
    };
    return getValue(type_map, type);
}

function readAscii(bytes) {
    var str = "";
    for (var i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) {
            continue;
        }
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}

function readD2DCommand(bytes) {
    return ("0" + (bytes[1] & 0xff).toString(16)).slice(-2) + ("0" + (bytes[0] & 0xff).toString(16)).slice(-2);
}
