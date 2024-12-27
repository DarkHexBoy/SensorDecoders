/**
 * Payload Encoder
 *
 * Copyright 2025 Milesight IoT
 *
 * @product UC521
 */
var RAW_VALUE = 0x00;

// Chirpstack v4
function encodeDownlink(input) {
    var encoded = milesightDeviceEncode(input.data);
    return { bytes: encoded };
}

// Chirpstack v3
function Encode(fPort, obj) {
    return milesightDeviceEncode(obj);
}

// The Things Network
function Encoder(obj, port) {
    return milesightDeviceEncode(obj);
}

function milesightDeviceEncode(payload) {
    var encoded = [];

    if ("reboot" in payload) {
        encoded = encoded.concat(reboot(payload.reboot));
    }
    if ("report_status" in payload) {
        encoded = encoded.concat(reportStatus(payload.report_status));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("timezone" in payload) {
        encoded = encoded.concat(setTimezone(payload.timezone));
    }
    if ("valve_1_task" in payload) {
        encoded = encoded.concat(setValveTask(0, payload.valve_1_task));
    }
    if ("valve_2_task" in payload) {
        encoded = encoded.concat(setValveTask(1, payload.valve_2_task));
    }
    if ("valve_1_pulse" in payload) {
        encoded = encoded.concat(setValvePulse(1, payload.valve_1_pulse));
    }
    if ("valve_2_pulse" in payload) {
        encoded = encoded.concat(setValvePulse(2, payload.valve_2_pulse));
    }
    if ("clear_valve_1_pulse" in payload) {
        encoded = encoded.concat(clearValvePulse(1, payload.clear_valve_1_pulse));
    }
    if ("clear_valve_2_pulse" in payload) {
        encoded = encoded.concat(clearValvePulse(2, payload.clear_valve_2_pulse));
    }
    if ("valve_1_config" in payload) {
        encoded = encoded.concat(setValveConfig(1, payload.valve_1_config));
    }
    if ("valve_2_config" in payload) {
        encoded = encoded.concat(setValveConfig(2, payload.valve_2_config));
    }
    if ("valve_filter_config" in payload) {
        encoded = encoded.concat(setValveFilterConfig(payload.valve_filter_config));
    }
    if ("pressure_1_calibration_config" in payload) {
        encoded = encoded.concat(setPressureCalibration(1, payload.pressure_1_calibration_config));
    }
    if ("pressure_2_calibration_config" in payload) {
        encoded = encoded.concat(setPressureCalibration(2, payload.pressure_2_calibration_config));
    }
    if ("batch_read_rules" in payload) {
        encoded = encoded.concat(batchReadRules(payload.batch_read_rules));
    }
    if ("batch_enable_rules" in payload) {
        encoded = encoded.concat(batchEnableRules(payload.batch_enable_rules));
    }
    if ("batch_remove_rules" in payload) {
        encoded = encoded.concat(batchRemoveRules(payload.batch_remove_rules));
    }
    var rule_x_enable_map = { rule_1_enable: 1, rule_2_enable: 2, rule_3_enable: 3, rule_4_enable: 4, rule_5_enable: 5, rule_6_enable: 6, rule_7_enable: 7, rule_8_enable: 8, rule_9_enable: 9, rule_10_enable: 10, rule_11_enable: 11, rule_12_enable: 12, rule_13_enable: 13, rule_14_enable: 14, rule_15_enable: 15, rule_16_enable: 16 };
    for (var key in rule_x_enable_map) {
        if (key in payload) {
            encoded = encoded.concat(enableRule(rule_x_enable_map[key], payload[key]));
        }
    }
    var rule_x_remove_map = { rule_1_remove: 1, rule_2_remove: 2, rule_3_remove: 3, rule_4_remove: 4, rule_5_remove: 5, rule_6_remove: 6, rule_7_remove: 7, rule_8_remove: 8, rule_9_remove: 9, rule_10_remove: 10, rule_11_remove: 11, rule_12_remove: 12, rule_13_remove: 13, rule_14_remove: 14, rule_15_remove: 15, rule_16_remove: 16 };
    for (var key in rule_x_remove_map) {
        if (key in payload) {
            encoded = encoded.concat(removeRule(rule_x_remove_map[key], payload[key]));
        }
    }
    if ("rules_config" in payload) {
        for (var i = 0; i < payload.rules_config.length; i++) {
            encoded = encoded.concat(setRulesConfig(payload.rules_config[i]));
        }
    }
    if ("query_rule_config" in payload) {
        encoded = encoded.concat(queryRuleConfig(payload.query_rule_config));
    }

    return encoded;
}

/**
 * reboot device
 * @param {number} reboot values: (0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, reboot) === 0) {
        return [];
    }
    return [0xff, 0x10, 0xff];
}

/**
 * report device status
 * @param {number} report_status values: (0: no, 1: yes)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, report_status) === 0) {
        return [];
    }
    return [0xff, 0x28, 0xff];
}

/**
 * set report interval
 * @param {number} report_interval unit: minute, range: [1, 1440]
 * @example { "report_interval": 20 }
 */
function setReportInterval(report_interval) {
    if (typeof report_interval !== "number") {
        throw new Error("report_interval must be a number");
    }
    if (report_interval < 1 || report_interval > 1440) {
        throw new Error("report_interval must be in range [1, 1440]");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x8e);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * set collection interval
 * @param {object} collection_interval
 * @param {number} collection_interval.pressure_1 unit: second, range: [10, 64800]
 * @param {number} collection_interval.pressure_2 unit: second, range: [10, 64800]
 * @example { "collection_interval": { "pressure_1": 300, "pressure_2": 300 } }
 */
function setCollectionInterval(collection_interval) {
    var encoded = [];

    if ("pressure_1" in collection_interval) {
        encoded = encoded.concat(setCollectionInterval(1, collection_interval.pressure_1));
    }
    if ("pressure_2" in collection_interval) {
        encoded = encoded.concat(setCollectionInterval(2, collection_interval.pressure_2));
    }
    return encoded;
}

function setCollectionInterval(index, collection_interval) {
    if (collection_interval < 10 || collection_interval > 64800) {
        throw new Error("collection_interval.pressure_" + index + " must be in range [10, 64800]");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbb);
    buffer.writeUInt8(index);
    buffer.writeUInt16LE(collection_interval);
    return buffer.toBytes();
}

/**
 * set timezone
 * @param {number} timezone unit: minute, convert: "hh:mm" -> "hh * 60 + mm", values: ( -720: UTC-12, -660: UTC-11, -600: UTC-10, -570: UTC-9:30, -540: UTC-9, -480: UTC-8, -420: UTC-7, -360: UTC-6, -300: UTC-5, -240: UTC-4, -210: UTC-3:30, -180: UTC-3, -120: UTC-2, -60: UTC-1, 0: UTC, 60: UTC+1, 120: UTC+2, 180: UTC+3, 240: UTC+4, 300: UTC+5, 360: UTC+6, 420: UTC+7, 480: UTC+8, 540: UTC+9, 570: UTC+9:30, 600: UTC+10, 660: UTC+11, 720: UTC+12, 765: UTC+12:45, 780: UTC+13, 840: UTC+14 )
 * @example { "timezone": 480 }
 * @example { "timezone": -240 }
 */
function setTimezone(timezone) {
    var timezone_map = { "-720": "UTC-12", "-660": "UTC-11", "-600": "UTC-10", "-570": "UTC-9:30", "-540": "UTC-9", "-480": "UTC-8", "-420": "UTC-7", "-360": "UTC-6", "-300": "UTC-5", "-240": "UTC-4", "-210": "UTC-3:30", "-180": "UTC-3", "-120": "UTC-2", "-60": "UTC-1", 0: "UTC", 60: "UTC+1", 120: "UTC+2", 180: "UTC+3", 210: "UTC+3:30", 240: "UTC+4", 270: "UTC+4:30", 300: "UTC+5", 330: "UTC+5:30", 345: "UTC+5:45", 360: "UTC+6", 390: "UTC+6:30", 420: "UTC+7", 480: "UTC+8", 540: "UTC+9", 570: "UTC+9:30", 600: "UTC+10", 630: "UTC+10:30", 660: "UTC+11", 720: "UTC+12", 765: "UTC+12:45", 780: "UTC+13", 840: "UTC+14" };
    var timezone_values = getValues(timezone_map);
    if (timezone_values.indexOf(timezone) === -1) {
        throw new Error("timezone must be one of " + timezone_values.join(", "));
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xbd);
    buffer.writeInt16LE(getValue(timezone_map, timezone));
    return buffer.toBytes();
}

/**
 * set valve task
 * @param {number} valve_index values: (1: valve 1, 2: valve 2)
 * @param {object} valve_task
 * @param {number} valve_task.task_id (0: force execute, 1-255: task id)
 * @param {number} valve_task.valve_opening
 * @param {number} valve_task.direction values: (0: left, 1: right), optional
 * @param {number} valve_task.time unit: min, optional
 * @param {number} valve_task.pulse unit: ms, optional
 * @example { "valve_1_task": { "valve_opening": 0 }}
 * @example { "valve_1_task": { "task_id": 1, "valve_opening": 1, "time": 1, "pulse": 1,  } }
 */
function setValveTask(valve_index, valve_task) {
    var task_id = 0;
    var valve_opening = valve_task.valve_opening;
    var time = valve_task.time;
    var pulse = valve_task.pulse;

    if ("task_id" in valve_task) {
        if (typeof valve_task.task_id !== "number") {
            throw new Error("valve_task.task_id must be a number");
        }
        task_id = valve_task.task_id;
    }
    if (typeof valve_opening !== "number") {
        throw new Error("valve_task.valve_opening must be a number");
    }

    var time_control_enable = 0;
    var valve_pulse_control_enable = 0;
    if ("time" in valve_task) {
        time_control_enable = 1;
    }
    if ("pulse" in valve_task) {
        valve_pulse_control_enable = 1;
    }

    var data = 0;
    data |= time_control_enable << 7;
    data |= valve_pulse_control_enable << 6;
    data |= valve_index;

    var data_extend_length = 0;
    if (time_control_enable === 1) {
        data_extend_length += 2;
    }
    if (valve_pulse_control_enable === 1) {
        data_extend_length += 4;
    }
    var buffer = new Buffer(5 + data_extend_length);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x19);
    buffer.writeUInt8(data);
    buffer.writeUInt8(task_id);
    buffer.writeUInt8(valve_opening);
    if (time_control_enable === 1) {
        buffer.writeUInt16LE(time);
    }
    if (valve_pulse_control_enable === 1) {
        buffer.writeUInt32LE(pulse);
    }
    return buffer.toBytes();
}

/**
 * set valve pulse
 * @param {number} valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} valve_pulse unit: ms
 * @example { "valve_1_pulse": 1000 }
 * @example { "valve_2_pulse": 1000 }
 */
function setValvePulse(valve_index, valve_pulse) {
    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x92);
    buffer.writeUInt8(valve_index);
    buffer.writeUInt32LE(valve_pulse);
    return buffer.toBytes();
}

/**
 * clear valve pulse
 * @param {number} valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} clear_valve_pulse values: (0: no, 1: yes)
 * @example { "clear_valve_1_pulse": 1 }
 * @example { "clear_valve_2_pulse": 1 }
 */
function clearValvePulse(valve_index, clear_valve_pulse) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(clear_valve_pulse) === -1) {
        throw new Error("clear_valve_pulse must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, clear_valve_pulse) === 0) {
        return [];
    }
    return [0xff, 0x4e, valve_index, 0x00];
}

/**
 * set valve config
 * @param {number} valve_index values: (0: valve 1, 1: valve 2)
 * @param {object} valve_config
 * @param {number} valve_config.type values: (0: 2-way ball valve, 1: 3-way ball valve)
 * @param {number} valve_config.auto_calibration_enable values: (0: disable, 1: enable)
 * @param {number} valve_config.report_after_calibration_enable values: (0: disable, 1: enable)
 * @param {number} valve_config.stall_strategy values: (0: close, 1: keep)
 * @param {number} valve_config.open_time_1 unit: second, (type=0, use; type=1, left)
 * @param {number} valve_config.open_time_2 unit: second, (type=0, no use; type=1, right)
 * @param {number} valve_config.stall_current unit: mA
 * @param {number} valve_config.stall_time unit: ms
 * @param {number} valve_config.protect_time unit: second
 * @param {number} valve_config.delay_time unit: second
 * @example { "valve_1_config": { "type": 0, "auto_calibration_enable": 1, "report_after_calibration_enable": 1, "stall_strategy": 1, "open_time_1": 10, "open_time_2": 10, "stall_current": 100, "stall_time": 10, "protect_time": 10, "delay_time": 10 } }
 */
function setValveConfig(valve_index, valve_config) {
    var type = valve_config.type;
    var auto_calibration_enable = valve_config.auto_calibration_enable;
    var report_after_calibration_enable = valve_config.report_after_calibration_enable;
    var stall_strategy = valve_config.stall_strategy;
    var open_time_1 = valve_config.open_time_1;
    var open_time_2 = valve_config.open_time_2;
    var stall_current = valve_config.stall_current;
    var stall_time = valve_config.stall_time;
    var protect_time = valve_config.protect_time;
    var delay_time = valve_config.delay_time;

    var type_map = { 0: "2-way ball valve", 1: "3-way ball valve" };
    var enable_map = { 0: "disable", 1: "enable" };
    var stall_strategy_map = { 0: "close", 1: "keep" };

    var data = 0;
    data |= valve_index << 7;
    data |= getValue(type_map, type) << 6;
    data |= getValue(enable_map, auto_calibration_enable) << 5;
    data |= getValue(enable_map, report_after_calibration_enable) << 4;
    data |= getValue(stall_strategy_map, stall_strategy) << 3;

    var buffer = new Buffer(11);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x1a);
    buffer.writeUInt8(data);
    buffer.writeUInt8(open_time_1);
    buffer.writeUInt8(open_time_2);
    buffer.writeUInt16LE(stall_current);
    buffer.writeUInt16LE(stall_time);
    buffer.writeUInt8(protect_time);
    buffer.writeUInt8(delay_time);
    return buffer.toBytes();
}

/**
 * set valve filter config
 * @param {object} valve_filter_config
 * @param {number} valve_filter_config.mode values: (0: hardware, 1: software)
 * @param {number} valve_filter_config.time (mode=0, unit: us; mode=1, unit: ms)
 * @example { "valve_filter_config": { "mode": 0, "time": 10 } }
 */
function setValveFilterConfig(valve_filter_config) {
    var mode = valve_filter_config.mode;
    var time = valve_filter_config.time;

    var mode_map = { 0: "hardware", 1: "software" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("valve_filter_config.mode must be one of " + mode_values.join(", "));
    }

    if (typeof time !== "number") {
        throw new Error("valve_filter_config.time must be a number");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x52);
    buffer.writeUInt8(0x00);
    buffer.writeUInt8(getValue(mode_map, mode));
    buffer.writeUInt16LE(time);
    return buffer.toBytes();
}

/**
 * set pressure calibration
 * @param {number} pressure_index values: (1: pressure 1, 2: pressure 2)
 * @param {object} pressure_calibration_config
 * @param {number} pressure_calibration_config.enable values: (0: disable, 1: enable)
 * @param {number} pressure_calibration_config.calibration unit: kPa
 * @example { "pressure_1_calibration_config": { "enable": 1, "calibration": 1 } }
 */
function setPressureCalibration(pressure_index, pressure_calibration_config) {
    var enable = pressure_calibration_config.enable;
    var calibration = pressure_calibration_config.calibration;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pressure_calibration_config.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xf9);
    buffer.writeUInt8(0x5b);
    buffer.writeUInt8(pressure_index);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration);
    return buffer.toBytes();
}

/**
 * read rules
 * @param {object} batch_read_rules
 * @param {number} batch_read_rules.rule_1
 * @param {number} batch_read_rules.rule_2
 * @param {number} batch_read_rules.rule_x
 * @param {number} batch_read_rules.rule_16
 * @example { "batch_read_rules": { "rules_id": 1 } }
 */
function batchReadRules(batch_read_rules) {
    var enable_map = { 0: "no", 1: "yes" };
    var enable_values = getValues(enable_map);

    var data = 0;
    var rule_bit_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };
    for (var key in rule_bit_offset) {
        if (key in batch_read_rules) {
            if (enable_values.indexOf(batch_read_rules[key]) === -1) {
                throw new Error("batch_read_rules." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, batch_read_rules[key]) << rule_bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x00); // read rules
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * batch enable rules
 * @param {object} batch_enable_rules
 * @param {number} batch_enable_rules.rule_1
 * @param {number} batch_enable_rules.rule_2
 * @param {number} batch_enable_rules.rule_x
 * @param {number} batch_enable_rules.rule_16
 * @example { "batch_enable_rules": { "rule_1": 1, "rule_2": 1, "rule_3": 1, "rule_4": 1 } }
 */
function batchEnableRules(batch_enable_rules) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);

    var data = 0;
    var rule_bit_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };
    for (var key in rule_bit_offset) {
        if (key in batch_enable_rules) {
            if (enable_values.indexOf(batch_enable_rules[key]) === -1) {
                throw new Error("batch_enable_rules." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, batch_enable_rules[key]) << rule_bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x01); // enable rules
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * batch remove rules
 * @param {object} batch_remove_rules
 * @param {number} batch_remove_rules.rule_1
 * @param {number} batch_remove_rules.rule_2
 * @param {number} batch_remove_rules.rule_x
 * @param {number} batch_remove_rules.rule_16
 * @example { "batch_remove_rules": { "rule_1": 1, "rule_2": 1, "rule_3": 1, "rule_4": 1 } }
 */
function batchRemoveRules(batch_remove_rules) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);

    var data = 0;
    var rule_bit_offset = { rule_1: 0, rule_2: 1, rule_3: 2, rule_4: 3, rule_5: 4, rule_6: 5, rule_7: 6, rule_8: 7, rule_9: 8, rule_10: 9, rule_11: 10, rule_12: 11, rule_13: 12, rule_14: 13, rule_15: 14, rule_16: 15 };
    for (var key in rule_bit_offset) {
        if (key in batch_remove_rules) {
            if (enable_values.indexOf(batch_remove_rules[key]) === -1) {
                throw new Error("batch_remove_rules." + key + " must be one of " + enable_values.join(", "));
            }
            data |= getValue(enable_map, batch_remove_rules[key]) << rule_bit_offset[key];
        }
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x02); // remove rules
    buffer.writeUInt16LE(data);
    return buffer.toBytes();
}

/**
 * enable rule
 * @param {number} rule_index range: [1, 16]
 * @param {number} enable values: (0: disable, 1: enable)
 * @example { "rule_1_enable": 1 }
 * @example { "rule_2_enable": 1 }
 */
function enableRule(rule_index, enable) {
    var enable_map = { 0: "no", 1: "yes" };
    var enable_values = getValues(enable_map);

    if (enable_values.indexOf(enable) === -1) {
        throw new Error("rule_" + rule_index + "_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x03); // enable single rule
    buffer.writeUInt8(rule_index);
    buffer.writeUInt8(getValue(enable_map, enable));
    return buffer.toBytes();
}

/**
 * remove rule
 * @param {number} rule_index range: [1, 16]
 * @example { "remove_rule": 1 }
 */
function removeRule(rule_index) {
    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4b);
    buffer.writeUInt8(0x04); // remove single rule
    buffer.writeUInt8(rule_index);
    buffer.writeUInt8(0x00);
    return buffer.toBytes();
}

/**
 * query rule config
 * @param {object} query_rule_config
 * @param {number} query_rule_config.index range: [1, 16]
 * @example { "query_rule_config": { "index": 1 } }
 */
function queryRuleConfig(query_rule_config) {
    var index = query_rule_config.index;

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x53);
    buffer.writeUInt8(index); // query rule config
    return buffer.toBytes();
}

/**
 * set rule config
 * @param {object} rule_config
 * @param {number} rule_config.index range: [1, 16]
 * @param {number} rule_config.enable values: (0: disable, 1: enable)
 * @param {object} rule_config.condition
 * @param {object} rule_config.action
 */
function setRuleConfig(rule_config) {
    var index = rule_config.index;
    var enable = rule_config.enable;
    var condition = rule_config.condition;
    var action = rule_config.action;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("rules_config._item.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(30);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x55);
    buffer.writeUInt8(index); // set rule config
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeBytes(encodedCondition(condition));
    buffer.writeBytes(encodedAction(action));
    return buffer.toBytes();
}

/**
 * rule config condition
 * @param {object} condition
 * @param {number} condition.type values: (0: none, 1: time, 2: d2d, 3: time or pulse threshold, 4: pulse threshold, 5: pressure threshold)
 * @param {number} condition.start_time unit: second
 * @param {number} condition.end_time unit: second
 * @param {number} condition.repeat_enable values: (0: disable, 1: enable)
 * @param {number} condition.repeat_mode values: (0: monthly, 1: daily, 2: weekly)
 * @param {number} condition.repeat_step
 * @param {object} condition.repeat_week
 * @param {number} condition.repeat_week.monday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.tuesday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.wednesday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.thursday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.friday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.saturday values: (0: disable, 1: enable)
 * @param {number} condition.repeat_week.sunday values: (0: disable, 1: enable)
 * @param {number} condition.d2d_command
 * @param {number} condition.valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} condition.duration unit: min
 * @param {number} condition.pressure_condition.pressure_index values: (1: pressure 1, 2: pressure 2)
 * @param {number} condition.pressure_condition.strategy values: (0: every change, 1: valve 1 open or valve 2 open, 2: valve ope
 * @param {number} condition.valve_strategy values: (0: no strategy, 1: pressure strategy)
 * @param {number} condition.condition_type values: (0: no strategy, 1: pressure strategy)
 * @param {number} condition.min_threshold unit: kPa
 * @param {number} condition.max_threshold unit: kPa
 */
function encodedCondition(condition) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    var condition_type_map = { 0: "none", 1: "time", 2: "d2d", 3: "time or pulse threshold", 4: "pulse threshold", 5: "pressure threshold" };
    var condition_type_values = getValues(condition_type_map);
    var repeat_mode_map = { 0: "monthly", 1: "daily", 2: "weekly" };
    var repeat_mode_values = getValues(repeat_mode_map);
    var weekday_bit_offset = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
    var weekday_values = getValues(weekday_bit_offset);
    var valve_strategy_map = { 0: "always", 1: "valve 1 open", 2: "valve 2 open", 3: "valve 1 open or valve 2 open" };
    var valve_strategy_values = getValues(valve_strategy_map);
    var condition_type_map = { 0: "none", 1: "less than", 2: "greater than", 3: "between", 4: "outside" };
    var condition_type_values = getValues(condition_type_map);

    var buffer = new Buffer(13);
    var condition_type_value = getValue(condition_type_map, condition.type);
    switch (condition_type_value) {
        case 0x00: // none
            break;
        case 0x01: // time condition (start_time, end_time, repeat_enable, repeat_mode, [repeat_step], [repeat_week])
            buffer.writeUInt32LE(condition.start_time);
            buffer.writeUInt32LE(condition.end_time);
            buffer.writeUInt8(getValue(enable_map, condition.repeat_enable));
            var repeat_mode_value = getValue(repeat_mode_map, condition.repeat_mode);
            buffer.writeUInt8(repeat_mode_value);
            // repeat mode: monthly or daily
            if (repeat_mode_value === 0x00 || repeat_mode_value === 0x01) {
                buffer.writeUInt16LE(condition.repeat_step);
            }
            // repeat mode: weekly
            else if (repeat_mode_value === 0x02) {
                var weekday_value = 0;
                for (var key in weekday_bit_offset) {
                    if (key in condition.repeat_week) {
                        if (enable_values.indexOf(condition.repeat_week[key]) === -1) {
                            throw new Error("rules_config._item.repeat_week." + key + " must be one of " + enable_values.join(", "));
                        }
                        weekday_value |= getValue(enable_map, condition.repeat_week[key]) << weekday_bit_offset[key];
                    }
                }
                buffer.writeUInt16LE(weekday_value);
            }
            break;
        case 0x02: // d2d condition (d2d_command)
            buffer.writeD2DCommand(condition.d2d_command, "0000");
            break;
        case 0x03: // time or pulse threshold condition (valve_index, duration, pulse_threshold)
            buffer.writeUInt8(condition.valve_index);
            buffer.writeUInt16LE(condition.duration);
            buffer.writeUInt32LE(condition.pulse_threshold);
            break;
        case 0x04: // pulse threshold condition (valve_index, pulse_threshold)
            buffer.writeUInt8(condition.valve_index);
            buffer.writeUInt32LE(condition.pulse_threshold);
            break;
        case 0x05: // pressure threshold condition
            buffer.writeUInt8(condition.valve_index);
            buffer.writeUInt8(getValue(valve_strategy_map, condition.valve_strategy));
            buffer.writeUInt8(getValue(condition_type_map, condition.condition_type));
            buffer.writeUInt16LE(condition.min_threshold);
            buffer.writeUInt16LE(condition.max_threshold);
            break;
    }

    return buffer.toBytes();
}

/**
 * rule config action
 * @param {object} action
 * @param {number} action.type values: (0: none, 1: em valve control, 2: valve control, 3: report)
 * @param {number} action.valve_index values: (1: valve 1, 2: valve 2)
 * @param {number} action.valve_opening
 * @param {number} action.time_enable values: (0: disable, 1: enable)
 * @param {number} action.duration unit: min
 * @param {number} action.pulse_enable values: (0: disable, 1: enable)
 * @param {number} action.pulse_threshold
 * @example { "rules_config": [ { "index": 1, "enable": 1, "condition": { "type": 0 }, "action": { "type": 1, "valve_index": 1, "valve_opening": 1, "time_enable": 1, "duration": 1, "pulse_enable": 1, "pulse_threshold": 1 } }]}
 */
function encodedAction(action) {
    var action_type_map = { 0: "none", 1: "em valve control", 2: "valve control", 3: "report" };
    var action_type_values = getValues(action_type_map);
    var report_type_map = { 0: "valve 1", 1: "valve 2", 2: "custom message", 3: "pressure threshold alarm" };
    var report_type_values = getValues(report_type_map);

    var buffer = new Buffer(13);
    var action_type_value = getValue(action_type_map, action.type);
    switch (action_type_value) {
        case 0x00: // none
            break;
        case 0x01: // em valve control (interrupt current execution task)
            buffer.writeUInt8(action.valve_index);
            buffer.writeUInt8(action.valve_opening);
            buffer.writeUInt8(action.time_enable);
            buffer.writeUInt32LE(action.duration);
            buffer.writeUInt8(action.pulse_enable);
            buffer.writeUInt32LE(action.pulse_threshold);
            break;
        case 0x02: // general valve control
            buffer.writeUInt8(action.valve_index);
            buffer.writeUInt8(action.valve_opening);
            buffer.writeUInt8(action.time_enable);
            buffer.writeUInt32LE(action.duration);
            buffer.writeUInt8(action.pulse_enable);
            buffer.writeUInt32LE(action.pulse_threshold);
            break;
        case 0x03: // report
            buffer.writeUInt8(getValue(report_type_map, action.report_type));
            buffer.writeAscii(action.report_content, 8);
            buffer.writeUInt8(0x00); // ignore the next byte
            buffer.writeUInt8(action.report_counts);
            buffer.writeUInt8(action.threshold_release_enable);
            break;
    }
    return buffer.toBytes();
}

function getValues(map) {
    var values = [];
    if (RAW_VALUE) {
        for (var key in map) {
            values.push(parseInt(key));
        }
    } else {
        for (var key in map) {
            values.push(map[key]);
        }
    }
    return values;
}

function getValue(map, value) {
    if (RAW_VALUE) return value;

    for (var key in map) {
        if (map[key] === value) {
            return parseInt(key);
        }
    }

    throw new Error("not match in " + JSON.stringify(map));
}

function Buffer(size) {
    this.buffer = new Array(size);
    this.offset = 0;

    for (var i = 0; i < size; i++) {
        this.buffer[i] = 0;
    }
}

Buffer.prototype._write = function (value, byteLength, isLittleEndian) {
    for (var index = 0; index < byteLength; index++) {
        var shift = isLittleEndian ? index << 3 : (byteLength - 1 - index) << 3;
        this.buffer[this.offset + index] = (value & (0xff << shift)) >> shift;
    }
};

Buffer.prototype.writeUInt8 = function (value) {
    this._write(value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeInt8 = function (value) {
    this._write(value < 0 ? value + 0x100 : value, 1, true);
    this.offset += 1;
};

Buffer.prototype.writeUInt16LE = function (value) {
    this._write(value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeInt16LE = function (value) {
    this._write(value < 0 ? value + 0x10000 : value, 2, true);
    this.offset += 2;
};

Buffer.prototype.writeUInt32LE = function (value) {
    this._write(value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeInt32LE = function (value) {
    this._write(value < 0 ? value + 0x100000000 : value, 4, true);
    this.offset += 4;
};

Buffer.prototype.writeD2DCommand = function (value, defaultValue) {
    if (typeof value !== "string") {
        value = defaultValue;
    }
    if (value.length !== 4) {
        throw new Error("d2d_cmd length must be 4");
    }
    this.buffer[this.offset] = parseInt(value.substr(2, 2), 16);
    this.buffer[this.offset + 1] = parseInt(value.substr(0, 2), 16);
    this.offset += 2;
};

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

Buffer.prototype.writeAscii = function (value, maxLength) {
    for (let i = 0; i < maxLength; i++) {
        if (i < value.length) {
            this.buffer[this.offset + i] = value.charCodeAt(i);
        } else {
            this.buffer[this.offset + i] = 0;
        }
    }
    this.offset += maxLength;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};
