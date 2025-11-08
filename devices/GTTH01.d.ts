import { BasicPort, BasicType } from "vrack2-core";
import DeviceRTU from "../../vrack2-modbus/devices/DeviceRTU";
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
export default class GTTH01 extends DeviceRTU {
    outputs(): {
        [key: string]: BasicPort;
    };
    checkOptions(): {
        [key: string]: BasicType;
    };
    shares: any;
    update(): Promise<void>;
    updateArray(regs: Array<{
        name: string;
        address: number;
    }>, command: number, obj: {
        [key: string]: any;
    }): Promise<void>;
}
