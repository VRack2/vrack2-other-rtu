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
 * Простое устройство  для получения температуры влажности
 * Обычно датчики типа XY-MD-02 имеют 2 регистра:
 *
 * Чтение 0x03
 * - 0x00 - Влажность
 * - 0x01 - Температура
 *
 * Можно поправить в сервис-файле параметр var что бы кастомизировать
 * получаемые данные/переменные
*/
class GTTH01 extends DeviceRTU_1.default {
    constructor() {
        super(...arguments);
        this.shares = {
            online: false,
            process: false,
            temperature: 0,
            humidity: 0
        };
    }
    outputs() {
        const op = Object.assign({}, super.outputs());
        // Добаляем порты на сонове парметров vars
        for (const pi of this.options.vars) {
            op[pi.name] = vrack2_core_1.Port.standart().description('Порт для параметра ' + pi.name);
        }
        return op;
    }
    checkOptions() {
        return Object.assign(Object.assign({}, super.checkOptions()), { vars: vrack2_core_1.Rule.array().content(vrack2_core_1.Rule.object().fields({
                name: vrack2_core_1.Rule.string().require().description('Название параметра'),
                address: vrack2_core_1.Rule.string().require().description('Адрес регистра')
            })).default([
                { name: 'humidity', address: 0x00 },
                { name: 'temperature', address: 0x01 },
            ]).description('Список параметров для чтения - используется команду 0x03 и преобразование readInt16BE') });
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateArray(this.options.vars, 0x03, this.shares);
        });
    }
    updateArray(regs, command, obj) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const reg of regs) {
                yield this.runQueue();
                const resp = yield this.simpleRequest(command, reg.address, 0x01);
                obj[reg.name] = resp.data.readInt16BE();
                this.ports.output[reg.name].push(resp.data.readInt16BE());
            }
        });
    }
}
exports.default = GTTH01;
