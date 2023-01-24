"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaximumTemperatureInKelvinForDevice = exports.getMinimumTemperatureInKelvinForDevice = exports.getMaximumBrightnessInLumenForDevice = exports.getMinimumBrightnessInLumenForDevice = exports.setBrightnessPercentage = exports.setBrightnessInLumen = exports.setTemperaturePercentage = exports.setTemperatureInKelvin = exports.turnOff = exports.turnOn = exports.findDevice = exports.DeviceType = void 0;
const node_hid_1 = __importDefault(require("node-hid"));
const utils_1 = require("./utils");
var DeviceType;
(function (DeviceType) {
    DeviceType["LitraGlow"] = "litra_glow";
    DeviceType["LitraBeam"] = "litra_beam";
})(DeviceType = exports.DeviceType || (exports.DeviceType = {}));
const VENDOR_ID = 0x046d;
const PRODUCT_IDS = [
    0xc900,
    0xc901, // Litra Beam
];
const USAGE_PAGE = 0xff43;
const MINIMUM_BRIGHTNESS_IN_LUMEN_BY_DEVICE_TYPE = {
    [DeviceType.LitraGlow]: 20,
    [DeviceType.LitraBeam]: 30,
};
const MAXIMUM_BRIGHTNESS_IN_LUMEN_BY_DEVICE_TYPE = {
    [DeviceType.LitraGlow]: 250,
    [DeviceType.LitraBeam]: 400,
};
const MINIMUM_TEMPERATURE_IN_KELVIN_BY_DEVICE_TYPE = {
    [DeviceType.LitraGlow]: 2700,
    [DeviceType.LitraBeam]: 2700,
};
const MAXIMUM_TEMPERATURE_IN_KELVIN_BY_DEVICE_TYPE = {
    [DeviceType.LitraGlow]: 6500,
    [DeviceType.LitraBeam]: 6500,
};
/**
 * Finds your Logitech Litra device and returns it. Returns `null` if a
 * supported device cannot be found connected to your computer.
 *
 * @returns {Device, null} An object representing your Logitech Litra device,
 * passed into other functions like `turnOn` and `setTemperatureInKelvin` -
 * or `null` if a matching device cannot be found connected to your computer.
 */
const findDevice = () => {
    const matchingDevice = node_hid_1.default.devices().find((device) => device.vendorId === VENDOR_ID &&
        PRODUCT_IDS.includes(device.productId) &&
        device.usagePage === USAGE_PAGE);
    if (matchingDevice) {
        return {
            type: getDeviceTypeByProductId(matchingDevice.productId),
            hid: new node_hid_1.default.HID(matchingDevice.path),
        };
    }
    else {
        return null;
    }
};
exports.findDevice = findDevice;
/**
 * Turns your Logitech Litra device on.
 *
 * @param {Device} device The device to set the temperature of
 */
const turnOn = (device) => {
    device.hid.write((0, utils_1.padRight)([0x11, 0xff, 0x04, 0x1c, 0x01], 20, 0x00));
};
exports.turnOn = turnOn;
/**
 * Turns your Logitech Litra device off.
 *
 * @param {Device} device The device to set the temperature of
 */
const turnOff = (device) => {
    device.hid.write((0, utils_1.padRight)([0x11, 0xff, 0x04, 0x1c, 0x00], 20, 0x00));
};
exports.turnOff = turnOff;
/**
 * Sets the temperature of your Logitech Litra device
 *
 * @param {Device} device The device to set the temperature of
 * @param {number} temperatureInKelvin The temperature to set in Kelvin. Use the
 *  `getMinimumTemperatureInKelvinForDevice` and `getMaximumTemperatureInKelvinForDevice`
 *  functions to get the minimum and maximum temperature for your device.
 */
const setTemperatureInKelvin = (device, temperatureInKelvin) => {
    if (!Number.isInteger(temperatureInKelvin)) {
        throw 'Provided temperature must be an integer';
    }
    const minimumTemperature = (0, exports.getMinimumTemperatureInKelvinForDevice)(device);
    const maximumTemperature = (0, exports.getMaximumTemperatureInKelvinForDevice)(device);
    if (temperatureInKelvin < minimumTemperature ||
        temperatureInKelvin > maximumTemperature) {
        throw `Provided temperature must be between ${minimumTemperature} and ${maximumTemperature} for this device`;
    }
    device.hid.write((0, utils_1.padRight)([0x11, 0xff, 0x04, 0x9c, ...(0, utils_1.integerToBytes)(temperatureInKelvin)], 20, 0x00));
};
exports.setTemperatureInKelvin = setTemperatureInKelvin;
/**
 * Set the temperature of your Logitech Litra device to a percentage
 * of the device's maximum temperature
 *
 * @param {Device} device The device to set the temperature of
 * @param {number} temperaturePercentage The percentage to set the temperature to
 */
const setTemperaturePercentage = (device, temperaturePercentage) => {
    if (temperaturePercentage < 0 || temperaturePercentage > 100) {
        throw 'Percentage must be between 0 and 100';
    }
    const minimumTemperature = (0, exports.getMinimumTemperatureInKelvinForDevice)(device);
    const maximumTemperature = (0, exports.getMaximumTemperatureInKelvinForDevice)(device);
    return (0, exports.setTemperatureInKelvin)(device, temperaturePercentage === 0
        ? minimumTemperature
        : (0, utils_1.percentageWithinRange)(temperaturePercentage, minimumTemperature, maximumTemperature));
};
exports.setTemperaturePercentage = setTemperaturePercentage;
/**
 * Sets the brightness of your Logitech Litra device, measured in Lumen
 *
 * @param {Device} device The device to set the temperature of
 * @param {number} brightnessInLumen The brightness to set in Lumen. Use the
 *  `getMinimumBrightnessInLumenForDevice` and `getMaximumBrightnessInLumenForDevice`
 *  functions to get the minimum and maximum brightness for your device.
 */
const setBrightnessInLumen = (device, brightnessInLumen) => {
    if (!Number.isInteger(brightnessInLumen)) {
        throw 'Provided brightness must be an integer';
    }
    const minimumBrightness = (0, exports.getMinimumBrightnessInLumenForDevice)(device);
    const maximumBrightness = (0, exports.getMaximumBrightnessInLumenForDevice)(device);
    if (brightnessInLumen < minimumBrightness || brightnessInLumen > maximumBrightness) {
        throw `Provided brightness must be between ${minimumBrightness} and ${maximumBrightness} for this device`;
    }
    device.hid.write((0, utils_1.padRight)([0x11, 0xff, 0x04, 0x4c, 0x00, brightnessInLumen], 20, 0x00));
};
exports.setBrightnessInLumen = setBrightnessInLumen;
/**
 * Set the brightness of your Logitech Litra device to a percentage
 * of the device's maximum brightness
 *
 * @param {Device} device The device to set the brightness of
 * @param {number} brightnessPercentage The percentage to set the brightness to
 */
const setBrightnessPercentage = (device, brightnessPercentage) => {
    if (brightnessPercentage < 0 || brightnessPercentage > 100) {
        throw 'Percentage must be between 0 and 100';
    }
    const minimumBrightness = (0, exports.getMinimumBrightnessInLumenForDevice)(device);
    const maximumBrightness = (0, exports.getMaximumBrightnessInLumenForDevice)(device);
    return (0, exports.setBrightnessInLumen)(device, brightnessPercentage === 0
        ? minimumBrightness
        : (0, utils_1.percentageWithinRange)(brightnessPercentage, minimumBrightness, maximumBrightness));
};
exports.setBrightnessPercentage = setBrightnessPercentage;
/**
 * Gets the type of a Logitech Litra device by its product IOD
 *
 * @param {number} productId The product ID of the device
 * @returns {DeviceType} The type of the device
 */
const getDeviceTypeByProductId = (productId) => {
    switch (productId) {
        case 0xc900:
            return DeviceType.LitraGlow;
        case 0xc901:
            return DeviceType.LitraBeam;
        default:
            throw 'Unknown device type';
    }
};
/**
 * Gets the minimum brightness in Lumen supported by a device
 *
 * @param {Device} device The device to check the minimum brightness for
 * @returns {number} The minimum brightness in Lumen supported by the device
 */
const getMinimumBrightnessInLumenForDevice = (device) => {
    return MINIMUM_BRIGHTNESS_IN_LUMEN_BY_DEVICE_TYPE[device.type];
};
exports.getMinimumBrightnessInLumenForDevice = getMinimumBrightnessInLumenForDevice;
/**
 * Gets the maximum brightness in Lumen supported by a device
 *
 * @param {Device} device The device to check the maximum brightness for
 * @returns {number} The maximum brightness in Lumen supported by the device
 */
const getMaximumBrightnessInLumenForDevice = (device) => {
    return MAXIMUM_BRIGHTNESS_IN_LUMEN_BY_DEVICE_TYPE[device.type];
};
exports.getMaximumBrightnessInLumenForDevice = getMaximumBrightnessInLumenForDevice;
/**
 * Gets the minimum temperature in Kelvin supported by a device
 *
 * @param {Device} device The device to check the minimum temperature for
 * @returns {number} The minimum temperature in Kelvin supported by the device
 */
const getMinimumTemperatureInKelvinForDevice = (device) => {
    return MINIMUM_TEMPERATURE_IN_KELVIN_BY_DEVICE_TYPE[device.type];
};
exports.getMinimumTemperatureInKelvinForDevice = getMinimumTemperatureInKelvinForDevice;
/**
 * Gets the maximum temperature in Kelvin supported by a device
 *
 * @param {Device} device The device to check the maximum temperature for
 * @returns {number} The maximum temperature in Kelvin supported by the device
 */
const getMaximumTemperatureInKelvinForDevice = (device) => {
    return MAXIMUM_TEMPERATURE_IN_KELVIN_BY_DEVICE_TYPE[device.type];
};
exports.getMaximumTemperatureInKelvinForDevice = getMaximumTemperatureInKelvinForDevice;
