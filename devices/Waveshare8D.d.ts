import { BasicType, BasicPort, BasicAction } from "vrack2-core";
import DeviceRTU from "../../vrack2-modbus/devices/DeviceRTU";
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
export default class Waveshare8D extends DeviceRTU {
    checkOptions(): {
        [key: string]: BasicType;
    };
    actions(): {
        [key: string]: BasicAction;
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
    shares: {
        [key: string]: any;
    };
    preProcess(): void;
    /**
     * Установка адреса
    */
    actionSetAddress(data: {
        value: number;
    }): Promise<{
        result: string;
    }>;
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
