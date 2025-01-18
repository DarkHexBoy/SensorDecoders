/**
 * Payload Decoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product TS201 v2
 */
var RAW_VALUE = 0x00;

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
            decoded.device_status = readOnOffStatus(1);
            i += 1;
        }
        // BATTERY
        else if (channel_id === 0x01 && channel_type === 0x75) {
            decoded.battery = readUInt8(bytes[i]);
            i += 1;
        }
        // TEMPERATURE
        else if (channel_id === 0x03 && channel_type === 0x67) {
            decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            i += 2;
        }
        // HUMIDITY
        else if (channel_id === 0x04 && channel_type === 0x68) {
            decoded.humidity = readUInt8(bytes[i]) / 2;
            i += 1;
        }
        // SENSOR ID
        else if (channel_id === 0xff && channel_type === 0xa0) {
            var data = readUInt8(bytes[i]);
            var channel_idx = (data >>> 4) & 0x0f;
            var sensor_type = (data >>> 0) & 0x0f;
            var sensor_id = readSerialNumber(bytes.slice(i + 1, i + 9));
            var sensor_chn_name = "sensor_" + channel_idx;
            i += 9;

            decoded[sensor_chn_name + "_type"] = readSensorIDType(sensor_type);
            decoded[sensor_chn_name + "_sn"] = sensor_id;
        }
        // TEMPERATURE THRESHOLD ALARM
        else if (channel_id === 0x83 && channel_type === 0x67) {
            var data = {};
            data.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            data.temperature_alarm = readAlarmType(bytes[i + 2]);
            i += 3;

            decoded.temperature = data.temperature;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HUMIDITY THRESHOLD ALARM
        else if (channel_id === 0x84 && channel_type === 0x68) {
            var data = {};
            data.humidity = readUInt8(bytes[i]) / 2;
            data.humidity_alarm = readAlarmType(bytes[i + 1]);
            i += 2;

            decoded.humidity = data.humidity;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // TEMPERATURE MUTATION ALARM
        else if (channel_id === 0x93 && channel_type === 0x67) {
            var data = {};
            data.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
            data.temperature_mutation = readInt16LE(bytes.slice(i + 2, i + 4)) / 10;
            data.temperature_alarm = readAlarmType(bytes[i + 4]);
            i += 5;

            decoded.temperature = data.temperature;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HUMIDITY MUTATION ALARM
        else if (channel_id === 0x94 && channel_type === 0x68) {
            var data = {};
            data.humidity = readUInt8(bytes[i]) / 2;
            data.humidity_mutation = readUInt8(bytes[i + 1]) / 10;
            data.humidity_alarm = readAlarmType(bytes[i + 2]);
            i += 3;

            decoded.humidity = data.humidity;
            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // TEMPERATURE SENSOR STATUS
        else if (channel_id === 0xb3 && channel_type === 0x67) {
            var data = {};
            data.temperature_sensor_status = readSensorStatus(bytes[i]);
            i += 1;

            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HUMIDITY SENSOR STATUS
        else if (channel_id === 0xb4 && channel_type === 0x68) {
            var data = {};
            data.humidity_sensor_status = readSensorStatus(bytes[i]);
            i += 1;

            decoded.event = decoded.event || [];
            decoded.event.push(data);
        }
        // HISTORY DATA
        else if (channel_id === 0x20 && channel_type === 0xce) {
            var timestamp = readUInt32LE(bytes.slice(i, i + 4));
            var sensor_type = bytes[i + 4];
            var temperature = readInt16LE(bytes.slice(i + 5, i + 7)) / 10;
            var humidity = readUInt8(bytes[i + 7]) / 2;
            var event = bytes[i + 8];
            i += 9;

            var data = {};
            data.timestamp = timestamp;
            data.sensor_type = readSensorIDType(sensor_type);
            data.event = readHistoryEvent(event, sensor_type);
            data.temperature = temperature;
            // SHT4X
            if (sensor_type === 2) {
                data.humidity = humidity;
            }

            decoded.history = decoded.history || [];
            decoded.history.push(data);
        }
        // DOWNLINK RESPONSE
        else if (channel_id === 0xfe) {
            result = handle_downlink_response(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else if (channel_id === 0xf8) {
            result = handle_downlink_response_ext(channel_type, bytes, i);
            decoded = Object.assign(decoded, result.data);
            i = result.offset;
        } else {
            break;
        }
    }

    return decoded;
}

function handle_downlink_response(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x02:
            decoded.collection_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0x35:
            decoded.d2d_key = readSerialNumber(bytes.slice(offset, offset + 8));
            offset += 8;
            break;
        case 0x68:
            decoded.history_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;
        case 0x8e:
            // skip first byte
            decoded.report_interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            offset += 3;
            break;
        case 0xea:
            var data = readUInt8(bytes[offset]);
            var calibration_value = readInt16LE(bytes.slice(offset + 1, offset + 3));

            var type = (data >>> 0) & 0x01;
            var enable_value = (data >>> 7) & 0x01;
            if (type === 0) {
                decoded.temperature_calibrate = {};
                decoded.temperature_calibrate.enable = readEnableStatus(enable_value);
                decoded.temperature_calibrate.calibration_value = calibration_value / 10;
            } else if (type === 1) {
                decoded.humidity_calibrate = {};
                decoded.humidity_calibrate.enable = readEnableStatus(enable_value);
                decoded.humidity_calibrate.calibration_value = calibration_value / 2;
            }
            offset += 3;
            break;
        case 0xf2:
            decoded.alarm_count = readUInt16LE(bytes.slice(offset, offset + 2));
            offset += 2;
            break;
        case 0xf5:
            decoded.threshold_alarm_enable = readEnableStatus(bytes[offset]);
            offset += 1;
            break;

        default:
            throw new Error("unknown downlink response");
    }

    return { data: decoded, offset: offset };
}

function handle_downlink_response_ext(channel_type, bytes, offset) {
    var decoded = {};

    switch (channel_type) {
        case 0x0b:
            var threshold_config_result = readUInt8(bytes[offset + 7]);
            var data_type = readUInt8(bytes[offset]);
            if (threshold_config_result === 0) {
                if (data_type === 0x01) {
                    decoded.temperature_threshold_config = {};
                    decoded.temperature_threshold_config.condition = readMathConditionType(bytes[offset + 1]);
                    decoded.temperature_threshold_config.max = readInt16LE(bytes.slice(offset + 2, offset + 4)) / 10;
                    decoded.temperature_threshold_config.min = readInt16LE(bytes.slice(offset + 4, offset + 6)) / 10;
                    decoded.temperature_threshold_config.enable = readEnableStatus(bytes[offset + 6]);
                } else if (data_type === 0x03) {
                    decoded.humidity_threshold_config = {};
                    decoded.humidity_threshold_config.condition = readMathConditionType(bytes[offset + 1]);
                    decoded.humidity_threshold_config.max = readUInt16LE(bytes.slice(offset + 2, offset + 4)) / 2;
                    decoded.humidity_threshold_config.min = readUInt16LE(bytes.slice(offset + 4, offset + 6)) / 2;
                    decoded.humidity_threshold_config.enable = readEnableStatus(bytes[offset + 6]);
                }
            } else {
                decoded.threshold_config_result = readResultStatus(threshold_config_result);
            }
            offset += 8;
            break;
        case 0x0c:
            var mutation_config_result = readUInt8(bytes[offset + 4]);
            var data_type = readUInt8(bytes[offset]);
            if (mutation_config_result === 0) {
                if (data_type === 0x02) {
                    decoded.temperature_mutation_config = {};
                    decoded.temperature_mutation_config.threshold = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 10;
                    decoded.temperature_mutation_config.enable = readEnableStatus(bytes[offset + 3]);
                } else if (data_type === 0x04) {
                    decoded.humidity_mutation_config = {};
                    decoded.humidity_mutation_config.threshold = readUInt16LE(bytes.slice(offset + 1, offset + 3)) / 2;
                    decoded.humidity_mutation_config.enable = readEnableStatus(bytes[offset + 3]);
                }
            } else {
                decoded.mutation_config_result = readResultStatus(mutation_config_result);
            }
            offset += 5;
            break;
        case 0x0d:
            var retransmit_config_result = readUInt8(bytes[offset + 3]);
            if (retransmit_config_result === 0) {
                decoded.retransmit_config = {};
                decoded.retransmit_config.enable = readEnableStatus(bytes[offset]);
                decoded.retransmit_config.interval = readUInt16LE(bytes.slice(offset + 1, offset + 3));
            } else {
                decoded.retransmit_config_result = readResultStatus(retransmit_config_result);
            }
            offset += 4;
            break;
        case 0x0e:
            var resend_config_result = readUInt8(bytes[offset + 2]);
            if (resend_config_result === 0) {
                decoded.resend_interval = readUInt16LE(bytes.slice(offset, offset + 2));
            } else {
                decoded.resend_config_result = readResultStatus(resend_config_result);
            }
            offset += 3;
            break;
        case 0x31:
            var fetch_sensor_id_result = readUInt8(bytes[offset + 1]);
            if (fetch_sensor_id_result === 0) {
                decoded.fetch_sensor_id = readUInt8(bytes[offset]);
            } else {
                decoded.fetch_sensor_id_result = readResultStatus(fetch_sensor_id_result);
            }
            offset += 2;
            break;
        case 0x32:
            var ack_retry_times_result = readUInt8(bytes[offset + 3]);
            if (ack_retry_times_result === 0) {
                // skip 2 byte
                decoded.ack_retry_times = readUInt8(bytes[offset + 2]);
            } else {
                decoded.ack_retry_times_result = readResultStatus(ack_retry_times_result);
            }
            offset += 4;
            break;
        case 0x63:
            var uplink_config_result = readUInt8(bytes[offset + 4]);
            if (uplink_config_result === 0) {
                decoded.uplink_config = {};
                decoded.uplink_config.d2d_uplink_enable = readEnableStatus(bytes[offset]);
                decoded.uplink_config.lora_uplink_enable = readEnableStatus(bytes[offset + 1]);
                decoded.uplink_config.sensor_data_config = readSensorDataConfig(bytes.slice(offset + 2, offset + 4));
            } else {
                decoded.uplink_config_result = readResultStatus(uplink_config_result);
            }
            offset += 5;
            break;
        case 0x66:
            var d2d_enable_result = readUInt8(bytes[offset + 1]);
            if (d2d_enable_result === 0) {
                decoded.d2d_enable = readEnableStatus(bytes[offset]);
            } else {
                decoded.d2d_enable_result = readResultStatus(d2d_enable_result);
            }
            offset += 2;
            break;
        case 0x69:
            var button_lock_config_result = readUInt8(bytes[offset + 1]);
            if (button_lock_config_result === 0) {
                decoded.button_lock_config = readButtonLockConfig(bytes[offset]);
            } else {
                decoded.button_lock_config_result = readResultStatus(button_lock_config_result);
            }
            offset += 2;
            break;
        case 0x6a:
            var led_indicator_config_result = readUInt8(bytes[offset + 1]);
            if (led_indicator_config_result === 0) {
                decoded.led_indicator_enable = readEnableStatus(bytes[offset]);
            } else {
                decoded.led_indicator_config_result = readResultStatus(led_indicator_config_result);
            }
            offset += 2;
            break;
        case 0x96:
            var d2d_master_config_result = readUInt8(bytes[offset + 8]);
            if (d2d_master_config_result === 0) {
                decoded.d2d_master_config = {};
                decoded.d2d_master_config.event = readD2DEventType(bytes[offset]);
                decoded.d2d_master_config.enable = readEnableStatus(bytes[offset + 1]);
                decoded.d2d_master_config.lora_uplink_enable = readEnableStatus(bytes[offset + 2]);
                decoded.d2d_master_config.d2d_cmd = readSerialNumber(bytes.slice(offset + 3, offset + 5));
                // skip 2 byte
            } else {
                decoded.d2d_master_config_result = readResultStatus(d2d_master_config_result);
            }
            offset += 9;
            break;
        default:
            decoded.unknown_downlink_response = readResultStatus(channel_type);
    }

    return { data: decoded, offset: offset };
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
    var status_map = { 0: "normal", 1: "reset" };
    return getValue(status_map, status);
}

function readOnOffStatus(status) {
    var status_map = { 0: "off", 1: "on" };
    return getValue(status_map, status);
}

function readEnableStatus(status) {
    var status_map = { 0: "disable", 1: "enable" };
    return getValue(status_map, status);
}

function readSensorIDType(type) {
    var sensor_id_map = { 1: "DS18B20", 2: "SHT4X" };
    return getValue(sensor_id_map, type);
}

function readAlarmType(type) {
    var alarm_map = {
        0: "threshold alarm release",
        1: "threshold alarm",
        2: "mutation alarm",
    };
    return getValue(alarm_map, type);
}

function readSensorStatus(type) {
    var status_map = { 0: "read error", 1: "out of range" };
    return getValue(status_map, type);
}

function readDataStatus(type) {
    var status_map = { 0: "normal", 1: "read error", 2: "out of range" };
    return getValue(status_map, type);
}

function readHistoryEvent(value, sensor_type) {
    var event_map = { 1: "periodic", 2: "temperature alarm (threshold or mutation)", 3: "temperature alarm release", 4: "humidity alarm (threshold or mutation)", 5: "humidity alarm release" };
    var sensor_status_map = { 0: "normal", 1: "read error", 2: "out of range" };

    var report_event = getValue(event_map, value & 0x0f);
    var humidity_event = getValue(sensor_status_map, (value >>> 4) & 0x03);
    var temperature_event = getValue(sensor_status_map, (value >>> 6) & 0x03);

    var data = {};
    data.event_type = report_event;
    if (sensor_type === 2) {
        data.humidity_sensor_status = humidity_event;
        data.temperature_sensor_status = temperature_event;
    } else {
        data.temperature_sensor_status = temperature_event;
    }
    return data;
}

function readMathConditionType(type) {
    var condition_map = { 1: "below", 2: "above", 3: "between", 4: "outside" };
    return getValue(condition_map, type);
}

function readD2DEventType(type) {
    var event_map = { 1: "temperature threshold alarm", 2: "temperature threshold alarm release", 3: "temperature mutation alarm", 4: "humidity threshold alarm", 5: "humidity threshold alarm release", 6: "humidity mutation alarm" };
    return getValue(event_map, type);
}

function readSensorDataConfig(value) {
    var sensor_bit_offset = { temperature: 0, humidity: 1 };
    var sensor_data_map = { 0: "disable", 1: "enable" };
    var data = {};
    for (var key in sensor_bit_offset) {
        data[key] = getValue(sensor_data_map, (value >>> sensor_bit_offset[key]) & 0x01);
    }
    return data;
}

function readButtonLockConfig(value) {
    var button_bit_offset = { power: 0, report: 1 };
    var button_data_map = { 0: "disable", 1: "enable" };
    var data = {};
    for (var key in button_bit_offset) {
        data[key] = getValue(button_data_map, (value >>> button_bit_offset[key]) & 0x01);
    }
    return data;
}

function readResultStatus(status) {
    var status_map = { 0: "success", 1: "forbidden", 2: "invalid parameter" };
    return getValue(status_map, status);
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readInt8(bytes) {
    var ref = readUInt8(bytes);
    return ref > 0x7f ? ref - 0x100 : ref;
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

function readFloatLE(bytes) {
    var bits = (bytes[3] << 24) | (bytes[2] << 16) | (bytes[1] << 8) | bytes[0];
    var sign = bits >>> 31 === 0 ? 1.0 : -1.0;
    var e = (bits >>> 23) & 0xff;
    var m = e === 0 ? (bits & 0x7fffff) << 1 : (bits & 0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return f;
}

function getValue(map, key) {
    if (RAW_VALUE) return key;

    var value = map[key];
    if (!value) value = "unknown";
    return value;
}

if (!Object.assign) {
    Object.defineProperty(Object, "assign", {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target) {
            "use strict";
            if (target == null) {
                // TypeError if undefined or null
                throw new TypeError("Cannot convert first argument to object");
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource == null) {
                    // Skip over if undefined or null
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        },
    });
}
