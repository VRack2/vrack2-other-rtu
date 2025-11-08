import { BasicPort, BasicType, Port, Rule } from "vrack2-core";
// Наследуем класс для упращения работы с устройствами ModbusRTU
import DeviceRTU from "../../vrack2-modbus/devices/DeviceRTU"

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

  outputs(): { [key: string]: BasicPort; } {
      const op = {
        ...super.outputs()
      }
      // Добаляем порты на сонове парметров vars
      for (const pi of this.options.vars){
          op[pi.name] = Port.standart().description('Порт для параметра ' + pi.name)
      }
      return op
  }

  checkOptions(): { [key: string]: BasicType; } {
      return {
        ...super.checkOptions(),
        vars: Rule.array().content(Rule.object().fields({
           name: Rule.string().require().description('Название параметра'),
           address: Rule.string().require().description('Адрес регистра')
        })).default([
          { name: 'humidity', address: 0x00 },
          { name: 'temperature', address: 0x01 },
        ]).description('Список параметров для чтения - используется команду 0x03 и преобразование readInt16BE')
      }
  }

  shares: any = {
    online: false,
    process: false,
    temperature: 0,
    humidity: 0
  }

  async update(): Promise<void> {
    await this.updateArray(this.options.vars, 0x03, this.shares);
  }

  async updateArray(
    regs: Array<{ name: string, address: number }>,
    command: number,
    obj: { [key: string]: any }
  ) {
    for (const reg of regs) {
      await this.runQueue();
      const resp = await this.simpleRequest(command, reg.address, 0x01);
      obj[reg.name] = resp.data.readInt16BE();
      this.ports.output[reg.name].push(resp.data.readInt16BE())
    }
  }
}