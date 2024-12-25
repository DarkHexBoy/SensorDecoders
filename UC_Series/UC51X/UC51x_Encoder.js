/**
 * Payload Encoder
 *
 * Copyright 2024 Milesight IoT
 *
 * @product UC51X
 */
var RAW_VALUE = 0x01;

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
    if ("sync_time" in payload) {
        encoded = encoded.concat(syncTime(payload.sync_time));
    }
    if ("collection_interval" in payload) {
        encoded = encoded.concat(setCollectionInterval(payload.collection_interval));
    }
    if ("report_interval" in payload) {
        encoded = encoded.concat(setReportInterval(payload.report_interval));
    }
    if ("clear_history_data" in payload) {
        encoded = encoded.concat(clearHistoryData(payload.clear_history_data));
    }
    if ("history_enable" in payload) {
        encoded = encoded.concat(setHistoryEnable(payload.history_enable));
    }
    if ("retransmit_enable" in payload) {
        encoded = encoded.concat(setRetransmitEnable(payload.retransmit_enable));
    }
    if ("retransmit_interval" in payload) {
        encoded = encoded.concat(setRetransmitInterval(payload.retransmit_interval));
    }
    if ("resend_interval" in payload) {
        encoded = encoded.concat(setResendInterval(payload.resend_interval));
    }
    if ("timezone" in payload) {
        encoded = encoded.concat(setTimezone(payload.timezone));
    }
    if ("sync_time_type" in payload) {
        encoded = encoded.concat(setSyncTimeType(payload.sync_time_type));
    }
    if ("d2d_key" in payload) {
        encoded = encoded.concat(setD2DKey(payload.d2d_key));
    }
    if ("d2d_enable" in payload) {
        encoded = encoded.concat(setD2DEnable(payload.d2d_enable));
    }
    if ("response_enable" in payload) {
        encoded = encoded.concat(setResponseEnable(payload.response_enable));
    }
    if ("class_a_response_time" in payload) {
        encoded = encoded.concat(setClassAResponseTime(payload.class_a_response_time));
    }
    if ("valve_1_pulse" in payload) {
        encoded = encoded.concat(setValvePulse1(payload.valve_1_pulse));
    }
    if ("valve_2_pulse" in payload) {
        encoded = encoded.concat(setValvePulse2(payload.valve_2_pulse));
    }
    if ("pulse_filter_config" in payload) {
        encoded = encoded.concat(setPulseFilterConfig(payload.pulse_filter_config));
    }
    if ("gpio_jitter_time" in payload) {
        encoded = encoded.concat(setGpioJitterTime(payload.gpio_jitter_time));
    }
    if ("valve_power_supply_config" in payload) {
        encoded = encoded.concat(setValvePowerSupplyConfig(payload.valve_power_supply_config));
    }
    if ("pressure_calibration" in payload) {
        encoded = encoded.concat(setPressureCalibration(payload.pressure_calibration));
    }

    return encoded;
}

/**
 * Reboot
 * @since hardware_version>=v2.0, firmware_version>=v2.2
 * @param {number} reboot values:(0: no, 1: yes)
 * @example { "reboot": 1 }
 */
function reboot(reboot) {
    var reboot_map = { 0: "no", 1: "yes" };
    var reboot_values = getValues(reboot_map);
    if (reboot_values.indexOf(reboot) === -1) {
        throw new Error("reboot must be one of " + reboot_values.join(", "));
    }

    if (getValue(reboot_map, reboot) === 0) {
        return [];
    }

    return [0xff, 0x10, 0xff];
}

/**
 * Report status
 * @since hardware_version>=v3.0, firmware_version>=v3.1
 * @param {number} report_status values:(0: no, 1: yes)
 * @example { "report_status": 1 }
 */
function reportStatus(report_status) {
    var report_status_map = { 0: "no", 1: "yes" };
    var report_status_values = getValues(report_status_map);
    if (report_status_values.indexOf(report_status) === -1) {
        throw new Error("report_status must be one of " + report_status_values.join(", "));
    }

    if (getValue(report_status_map, report_status) === 0) {
        return [];
    }

    return [0xff, 0x28, 0xff];
}

/**
 * Sync time
 * @since hardware_version>=v2.0, firmware_version>=v2.1
 * @param {number} sync_time values: (0: no, 1: yes)
 * @example { "sync_time": 1 }
 */
function syncTime(sync_time) {
    var yes_no_map = { 0: "no", 1: "yes" };
    var yes_no_values = getValues(yes_no_map);
    if (yes_no_values.indexOf(sync_time) === -1) {
        throw new Error("sync_time must be one of " + yes_no_values.join(", "));
    }

    if (getValue(yes_no_map, sync_time) === 0) {
        return [];
    }
    return [0xff, 0x4a, 0x00];
}
/**
 * Set collection interval
 * @param {number} collection_interval unit: second, range: [10, 64800]
 * @example { "collection_interval": 10 }
 */
function setCollectionInterval(collection_interval) {
    if (collection_interval < 10 || collection_interval > 64800) {
        throw new Error("collection_interval must be in the range of 10 to 64800");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x02);
    buffer.writeUInt16LE(collection_interval);
    return buffer.toBytes();
}

/**
 * Set report interval
 * @param {number} report_interval unit: second, range: [10, 64800]
 * @example { "report_interval": 10 }
 */
function setReportInterval(report_interval) {
    if (report_interval < 10 || report_interval > 64800) {
        throw new Error("report_interval must be in the range of 10 to 64800");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x03);
    buffer.writeUInt16LE(report_interval);
    return buffer.toBytes();
}

/**
 * Clear history data
 * @since hardware_version>=v3.0, firmware_version>=v3.1
 * @param {number} clear_history_data values:(0: no, 1: yes)
 * @example { "clear_history_data": 1 }
 */
function clearHistoryData(clear_history_data) {
    var clear_history_data_map = { 0: "no", 1: "yes" };
    var clear_history_data_values = getValues(clear_history_data_map);
    if (clear_history_data_values.indexOf(clear_history_data) === -1) {
        throw new Error("clear_history_data must be one of " + clear_history_data_values.join(", "));
    }

    if (getValue(clear_history_data_map, clear_history_data) === 0) {
        return [];
    }

    return [0xff, 0x27, 0xff];
}

/**
 * history enable
 * @since hardware_version>=v3.0, firmware_version>=v3.1
 * @param {number} history_enable values: (0: disable, 1: enable)
 * @example { "history_enable": 1 }
 */
function setHistoryEnable(history_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(history_enable) === -1) {
        throw new Error("history_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x68);
    buffer.writeUInt8(getValue(enable_map, history_enable));
    return buffer.toBytes();
}

/**
 * retransmit enable
 * @since hardware_version>=v3.0, firmware_version>=v3.1
 * @param {number} retransmit_enable values: (0: disable, 1: enable)
 * @example { "retransmit_enable": 1 }
 */
function setRetransmitEnable(retransmit_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(retransmit_enable) === -1) {
        throw new Error("retransmit_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x69);
    buffer.writeUInt8(getValue(enable_map, retransmit_enable));
    return buffer.toBytes();
}

/**
 * retransmit interval
 * @since hardware_version>=v3.0, firmware_version>=v3.1
 * @param {number} retransmit_interval unit: second, range: [30, 1200]
 * @example { "retransmit_interval": 60 }
 */
function setRetransmitInterval(retransmit_interval) {
    if (retransmit_interval < 30 || retransmit_interval > 1200) {
        throw new Error("retransmit_interval must be in the range of 30 to 1200");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x00);
    buffer.writeUInt16LE(retransmit_interval);
    return buffer.toBytes();
}

/**
 * resend interval
 * @since hardware_version>=v3.0, firmware_version>=v3.1
 * @param {number} resend_interval unit: second, range: [30, 1200]
 * @example { "resend_interval": 60 }
 */
function setResendInterval(resend_interval) {
    if (resend_interval < 30 || resend_interval > 1200) {
        throw new Error("resend_interval must be in the range of 30 to 1200");
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x6a);
    buffer.writeUInt8(0x01);
    buffer.writeUInt16LE(resend_interval);
    return buffer.toBytes();
}

/**
 * Set timezone
 * @since hardware_version>=v2.0, firmware_version>=v2.1
 * @param {number} timezone unit: minute, range: [-12, 14]
 * @example { "timezone": 8 }
 */
function setTimezone(timezone) {
    if (timezone < -12 || timezone > 14) {
        throw new Error("timezone must be in the range of -12 to 14");
    }

    var buffer = new Buffer(4);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x17);
    buffer.writeUInt16LE(timezone * 10);
    return buffer.toBytes();
}

/**
 * Set sync time type
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {number} sync_time_type values: (1: v1.0.2, 2: v1.0.3, 3: v1.1.0)
 * @example { "sync_time_type": 2 }
 */
function setSyncTimeType(sync_time_type) {
    var sync_time_type_map = { 1: "v1.0.2", 2: "v1.0.3", 3: "v1.1.0" };
    var sync_time_type_values = getValues(sync_time_type_map);
    if (sync_time_type_values.indexOf(sync_time_type) === -1) {
        throw new Error("sync_time_type must be one of " + sync_time_type_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x3b);
    buffer.writeUInt8(getValue(sync_time_type_map, sync_time_type));
    return buffer.toBytes();
}

/**
 * set d2d key
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {string} d2d_key
 * @example { "d2d_key": "0000000000000000" }
 */
function setD2DKey(d2d_key) {
    if (typeof d2d_key !== "string") {
        throw new Error("d2d_key must be a string");
    }
    if (d2d_key.length !== 16) {
        throw new Error("d2d_key must be 16 characters");
    }
    if (!/^[0-9A-F]+$/.test(d2d_key)) {
        throw new Error("d2d_key must be hex string [0-9A-F]");
    }

    var data = hexStringToBytes(d2d_key);
    var buffer = new Buffer(10);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x35);
    buffer.writeBytes(data);
    return buffer.toBytes();
}

/**
 * set d2d enable
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {number} d2d_enable values: (0: "disable", 1: "enable")
 * @example { "d2d_enable": 1 }
 */
function setD2DEnable(d2d_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(d2d_enable) === -1) {
        throw new Error("d2d_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x84);
    buffer.writeUInt8(getValue(enable_map, d2d_enable));
    return buffer.toBytes();
}

/**
 * set response enable
 * @since hardware_version>=v3.0, firmware_version>=v3.3
 * @param {number} response_enable values: (0: disable, 1: enable)
 * @example { "response_enable": 1 }
 */
function setResponseEnable(response_enable) {
    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(response_enable) === -1) {
        throw new Error("response_enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xf3);
    buffer.writeUInt8(getValue(enable_map, response_enable));
    return buffer.toBytes();
}

/**
 * set class a response time
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {number} class_a_response_time unit: s, range: [0, 64800]
 * @example { "class_a_response_time": 10 }
 */
function setClassAResponseTime(class_a_response_time) {
    if (class_a_response_time < 0 || class_a_response_time > 64800) {
        throw new Error("class_a_response_time must be in the range of 0 to 64800");
    }

    var buffer = new Buffer(6);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x1e);
    buffer.writeUInt32LE(class_a_response_time);
    return buffer.toBytes();
}

/**
 * set valve pulse 1
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {number} valve_1_pulse
 * @example { "valve_1_pulse": 100 }
 */
function setValvePulse1(valve_1_pulse) {
    if (typeof valve_1_pulse !== "number") {
        throw new Error("valve_1_pulse must be a number");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x92);
    buffer.writeUInt8(0x01);
    buffer.writeUInt32LE(valve_1_pulse);
    return buffer.toBytes();
}

/**
 * set valve pulse 2
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {number} valve_2_pulse unit: pulse
 * @example { "valve_2_pulse": 100 }
 */
function setValvePulse2(valve_2_pulse) {
    if (typeof valve_2_pulse !== "number") {
        throw new Error("valve_2_pulse must be a number");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x92);
    buffer.writeUInt8(0x02);
    buffer.writeUInt32LE(valve_2_pulse);
    return buffer.toBytes();
}

/**
 * set pulse filter config
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {object} pulse_filter_config
 * @param {number} pulse_filter_config.mode values: (1: hardware, 2: software)
 * @param {number} pulse_filter_config.time hardware: unit: us, software: unit: ms
 * @example { "pulse_filter_config": { "mode": 1, "time": 40 } }
 */
function setPulseFilterConfig(pulse_filter_config) {
    var mode = pulse_filter_config.mode;
    var time = pulse_filter_config.time;

    var mode_map = { 1: "hardware", 2: "software" };
    var mode_values = getValues(mode_map);
    if (mode_values.indexOf(mode) === -1) {
        throw new Error("pulse_filter_config.mode must be one of " + mode_values.join(", "));
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
 * set gpio jitter time
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {number} gpio_jitter_time unit: s
 * @example { "gpio_jitter_time": 40 }
 */
function setGpioJitterTime(gpio_jitter_time) {
    if (typeof gpio_jitter_time !== "number") {
        throw new Error("gpio_jitter_time must be a number");
    }

    var buffer = new Buffer(3);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x46);
    buffer.writeUInt8(gpio_jitter_time);
    return buffer.toBytes();
}

/**
 * set valve power supply config
 * @since hardware_version>=v2.0, firmware_version>=v2.3
 * @param {object} valve_power_supply_config
 * @param {number} valve_power_supply_config.counts range: [1, 5]
 * @param {number} valve_power_supply_config.control_pulse_time unit: ms, range: [20, 1000]
 * @param {number} valve_power_supply_config.power_time unit: ms, range: [500, 10000]
 * @example { "valve_power_supply_config": { "counts": 1, "control_pulse_time": 100, "power_time": 1000 } }
 */
function setValvePowerSupplyConfig(valve_power_supply_config) {
    var counts = valve_power_supply_config.counts;
    var control_pulse_time = valve_power_supply_config.control_pulse_time;
    var power_time = valve_power_supply_config.power_time;

    if (counts < 1 || counts > 5) {
        throw new Error("valve_power_supply_config.counts must be in the range of 1 to 5");
    }
    if (control_pulse_time < 20 || control_pulse_time > 1000) {
        throw new Error("valve_power_supply_config.control_pulse_time must be in the range of 20 to 1000");
    }
    if (power_time < 500 || power_time > 10000) {
        throw new Error("valve_power_supply_config.power_time must be in the range of 500 to 10000");
    }

    var buffer = new Buffer(7);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0x4f);
    buffer.writeUInt8(counts);
    buffer.writeUInt16LE(control_pulse_time);
    buffer.writeUInt16LE(power_time);
    return buffer.toBytes();
}

/**
 * set pressure calibration
 * @since hardware_version>=v4.0, firmware_version>=v1.1
 * @param {object} pressure_calibration
 * @param {number} pressure_calibration.enable values: (0: disable, 1: enable)
 * @param {number} pressure_calibration.calibration_value unit: kPa
 * @example { "pressure_calibration": { "enable": 1, "calibration_value": 1 } }
 */
function setPressureCalibration(pressure_calibration) {
    var enable = pressure_calibration.enable;
    var calibration_value = pressure_calibration.calibration_value;

    var enable_map = { 0: "disable", 1: "enable" };
    var enable_values = getValues(enable_map);
    if (enable_values.indexOf(enable) === -1) {
        throw new Error("pressure_calibration.enable must be one of " + enable_values.join(", "));
    }

    var buffer = new Buffer(5);
    buffer.writeUInt8(0xff);
    buffer.writeUInt8(0xab);
    buffer.writeUInt8(getValue(enable_map, enable));
    buffer.writeInt16LE(calibration_value);
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
            return key;
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

Buffer.prototype.writeBytes = function (bytes) {
    for (var i = 0; i < bytes.length; i++) {
        this.buffer[this.offset + i] = bytes[i];
    }
    this.offset += bytes.length;
};

Buffer.prototype.toBytes = function () {
    return this.buffer;
};

function hexStringToBytes(hex) {
    var bytes = [];
    for (var c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return bytes;
}
