import { BasicType, BasicPort } from "vrack2-core";
import DeviceRTU from "../../vrack2-modbus/devices/DeviceRTU";
/**
 *
*/
export default class AXCX4040 extends DeviceRTU {
    checkOptions(): {
        [key: string]: BasicType;
    };
    inputs(): {
        [key: string]: BasicPort;
    };
    outputs(): {
        'di%d': import("vrack2-core/lib/ports/StandartPort").default;
        'do%d': import("vrack2-core/lib/ports/StandartPort").default;
        status: import("vrack2-core/lib/ports/StandartPort").default;
        provider: import("vrack2-core/lib/ports/StandartPort").default;
    };
    shares: any;
    preProcess(): void;
    /**
     * Обработчик для управление DO
    */
    inputDo(idx: number, data: any): void;
    /**
     * Переопределяем обновление
     *
    */
    update(): Promise<void>;
    /**
     * Обновляем битовые статусы
    */
    updateStatus(cmd: number, count: number, mask: string, arr: string): Promise<void>;
    /**
     * Записываем изменения в выход
    */
    writeOutput(): Promise<void>;
    /**
     * Преобразует число в массив бит
    */
    private n2ba;
}
