import { BasicType, Rule, Port, BasicPort } from "vrack2-core";
// Наследуем класс для упращения работы с устройствами ModbusRTU
import DeviceRTU from "../../vrack2-modbus/devices/DeviceRTU"

/**
 * 
*/
export default class AXCX4040 extends DeviceRTU {

  checkOptions(): { [key: string]: BasicType; } {
    return {
      ...super.checkOptions(),
      eachGate: Rule.boolean().default(false).description('Отправлять все полученные значения (true), Отправлять только изменения (false)')
    }
  }

  inputs(): { [key: string]: BasicPort; } {
      return {
        ...super.inputs(),
        'do%d': Port.standart().dynamic(4).description('Изменение состояния дискретного выхода (0 или 1)'),
      }
  }

  outputs() {
    return {
      ...super.outputs(),
      'di%d': Port.standart().dynamic(4).description('Значение дискретного входа (0 или 1)'),
      'do%d': Port.standart().dynamic(4).description('Текущее состояние дискретного выхода (0 или 1)'),
      status: Port.standart().description('Статус устройства (онлайн/оффлайн)'),
      provider: Port.standart().description('Повторный вывод провайдера')
    }
  }

  shares: any = {
    online: false,
    process: false,
    di: [0, 0, 0, 0],
    do: [0, 0, 0, 0],
    inputMask: 0,
    outputMask: 0,
    writeMask: 0,
  }
  preProcess() {
    // Добавляем динамические обработчики для do1..do4
    for (let i = 1; i <= 4; i++) {
      this.addInputHandler(`do${i}`, (data) => this.inputDo(i, data))
    }
  }

  /**
   * Обработчик для управление DO
  */
  inputDo(idx: number, data: any) {
    if (data) this.shares.writeMask |= (1 << (idx - 1)); else this.shares.writeMask &= ~(1 << (idx - 1))
  }

  /**
   * Переопределяем обновление
   * 
  */
  async update() {
    this.ports.output.status.push(this.shares.online)
    await this.updateStatus(0x02, 0x04, 'inputMask', 'di')
    await this.updateStatus(0x01, 0x04, 'outputMask', 'do')
    await this.writeOutput()
    this.ports.output.status.push(this.shares.online)
  }

  /**
   * Обновляем битовые статусы 
  */
  async updateStatus(cmd: number, count: number, mask: string, arr: string) {
    const resp = await this.simpleRequest(cmd, 0x00, count)
    var bitmask = resp.data.readUInt8()
    if (this.shares[mask] === bitmask && !this.options.eachGate) return
    for (let i = 0; i < 4; i++) {
      const s = (bitmask >> i) & 1
      if (this.shares[arr][i] === s && !this.options.eachGate) continue
      this.shares[arr][i] = s
      this.ports.output[arr + (i + 1)].push(s)
    }
    this.shares[mask] = bitmask
  }

  /**
   * Записываем изменения в выход
  */
  async writeOutput() {
    if (this.shares.writeMask === this.shares.outputMask) return
    this.simpleRequest(0x0F, 0x00, 0x04,this.n2ba(this.shares.writeMask))
  }

  /**
   * Преобразует число в массив бит
  */
  private n2ba(n: number): number[] {
    if (n === 0) return [0];
    const bits: number[] = [];
    while (n) { bits.push(n & 1); n >>>= 1; }
    return bits.reverse();
  }
}