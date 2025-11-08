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
 *
*/
class AXCX4040 extends DeviceRTU_1.default {
    constructor() {
        super(...arguments);
        this.shares = {
            online: false,
            process: false,
            di: [0, 0, 0, 0],
            do: [0, 0, 0, 0],
            inputMask: 0,
            outputMask: 0,
            writeMask: 0,
        };
    }
    checkOptions() {
        return Object.assign(Object.assign({}, super.checkOptions()), { eachGate: vrack2_core_1.Rule.boolean().default(false).description('Отправлять все полученные значения (true), Отправлять только изменения (false)') });
    }
    inputs() {
        return Object.assign(Object.assign({}, super.inputs()), { 'do%d': vrack2_core_1.Port.standart().dynamic(4).description('Изменение состояния дискретного выхода (0 или 1)') });
    }
    outputs() {
        return Object.assign(Object.assign({}, super.outputs()), { 'di%d': vrack2_core_1.Port.standart().dynamic(4).description('Значение дискретного входа (0 или 1)'), 'do%d': vrack2_core_1.Port.standart().dynamic(4).description('Текущее состояние дискретного выхода (0 или 1)'), status: vrack2_core_1.Port.standart().description('Статус устройства (онлайн/оффлайн)'), provider: vrack2_core_1.Port.standart().description('Повторный вывод провайдера') });
    }
    preProcess() {
        // Добавляем динамические обработчики для do1..do4
        for (let i = 1; i <= 4; i++) {
            this.addInputHandler(`do${i}`, (data) => this.inputDo(i, data));
        }
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
            for (let i = 0; i < 4; i++) {
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
exports.default = AXCX4040;
