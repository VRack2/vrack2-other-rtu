"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vrack2_core_1 = require("vrack2-core");
// Наследуем класс для упращения работы с устройствами ModbusRTU
const DeviceRTU_1 = __importDefault(require("../../vrack2-modbus/devices/DeviceRTU"));
/**
 * Waveshare Relay8D
 *
 * Power supply 	                7~36V
 * Communication interface 	        RS485
 * Default communication format 	9600, N, 8, 1
 * Relay channels 	                8
 * Contact form 	                1NO 1NC
 * Digital input 	                8DI, 5~36V, passive / active input (NPN or PNP), built-in bi-directional optocoupler isolation
 * Communication protocol 	        Standard Modbus RTU protocol
*/
class Waveshare8D extends DeviceRTU_1.default {
    constructor() {
        super(...arguments);
        this.shares = {
            online: false,
            process: false,
            di: [0, 0, 0, 0, 0, 0, 0, 0],
            do: [0, 0, 0, 0, 0, 0, 0, 0],
            inputMask: 0,
            outputMask: 0,
            writeMask: 0,
        };
    }
    checkOptions() {
        return Object.assign(Object.assign({}, super.checkOptions()), { eachGate: vrack2_core_1.Rule.boolean().default(false).description('Отправлять все полученные значения (true), Отправлять только изменения (false)') });
    }
    actions() {
        return {
            'set.address': vrack2_core_1.Action.global().requirements({
                value: vrack2_core_1.Rule.number().integer().default(1).min(0).max(254).description('Новый адрес')
            }).description('Установка адреса')
        };
    }
    inputs() {
        return Object.assign(Object.assign({}, super.inputs()), { 'do%d': vrack2_core_1.Port.standart().dynamic(8).description('Изменение состояния дискретного выхода') });
    }
    outputs() {
        return Object.assign(Object.assign({}, super.outputs()), { 'di%d': vrack2_core_1.Port.standart().dynamic(8).description('Значение дискретного входа'), 'do%d': vrack2_core_1.Port.standart().dynamic(8).description('Текущее состояние дискретного выхода'), status: vrack2_core_1.Port.standart().description('Статус устройства (онлайн/оффлайн)'), provider: vrack2_core_1.Port.standart().description('Выход для передачи управления провайдером') });
    }
    preProcess() {
        for (let i = 1; i <= 8; i++) {
            this.addInputHandler(`do${i}`, (data) => this.inputDo(i, data));
        }
    }
    /**
     * Установка адреса
    */
    actionSetAddress(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.actionAddQueue(() => {
                return this.simpleRequest(0x06, 0x4000, data.value);
            });
            return { result: 'success' };
        });
    }
    /**
     * Обработчик для управление DO
    */
    inputDo(idx, data) {
        if (data)
            this.shares.writeMask |= (1 << (idx - 1));
        else
            this.shares.writeMask &= ~(1 << (idx - 1));
    }
    /**
     * Переопределяем обновление
     *
    */
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            this.ports.output.status.push(this.shares.online);
            yield this.updateStatus(0x02, 0x04, 'inputMask', 'di');
            yield this.updateStatus(0x01, 0x04, 'outputMask', 'do');
            yield this.writeOutput();
            this.ports.output.status.push(this.shares.online);
        });
    }
    /**
     * Обновляем битовые статусы
    */
    updateStatus(cmd, count, mask, arr) {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.simpleRequest(cmd, 0x00, count);
            var bitmask = resp.data.readUInt8();
            if (this.shares[mask] === bitmask && !this.options.eachGate)
                return;
            for (let i = 0; i < 8; i++) {
                const s = (bitmask >> i) & 1;
                if (this.shares[arr][i] === s && !this.options.eachGate)
                    continue;
                this.shares[arr][i] = s;
                this.ports.output[arr + (i + 1)].push(s);
            }
            this.shares[mask] = bitmask;
        });
    }
    /**
     * Записываем изменения в выход
    */
    writeOutput() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.shares.writeMask === this.shares.outputMask)
                return;
            this.simpleRequest(0x0F, 0x00, 0x04, this.n2ba(this.shares.writeMask));
        });
    }
    /**
     * Преобразует число в массив бит
    */
    n2ba(n) {
        if (n === 0)
            return [0];
        const bits = [];
        while (n) {
            bits.push(n & 1);
            n >>>= 1;
        }
        return bits.reverse();
    }
}
exports.default = Waveshare8D;
