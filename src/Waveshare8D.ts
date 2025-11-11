import { BasicType, Rule, Port, BasicPort, BasicAction, Action } from "vrack2-core";
// Наследуем класс для упращения работы с устройствами ModbusRTU
import DeviceRTU from "../../vrack2-modbus/devices/DeviceRTU"

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

  checkOptions(): { [key: string]: BasicType; } {
    return {
      ...super.checkOptions(),
      eachGate: Rule.boolean().default(false).description('Отправлять все полученные значения (true), Отправлять только изменения (false)')
    }
  }

  actions(): { [key: string]: BasicAction; } {
    return {
      'set.address': Action.global().requirements({
        value: Rule.number().integer().default(1).min(0).max(254).description('Новый адрес')
      }).description('Установка адреса')
    }
  }


  inputs(): { [key: string]: BasicPort; } {
      return {
        ...super.inputs(),
        'do%d': Port.standart().dynamic(8).description('Изменение состояния дискретного выхода'),
      }
  }

  outputs() {
    return {
      ...super.outputs(),
      'di%d': Port.standart().dynamic(8).description('Значение дискретного входа'),
      'do%d': Port.standart().dynamic(8).description('Текущее состояние дискретного выхода'),
      status: Port.standart().description('Статус устройства (онлайн/оффлайн)'),
      provider: Port.standart().description('Выход для передачи управления провайдером')
    }
  }

  shares: { [key:string]: any } =  {
    online: false,
    process: false,
    di: [0, 0, 0, 0, 0, 0, 0, 0],
    do: [0, 0, 0, 0, 0, 0, 0, 0],
    inputMask: 0,
    outputMask: 0,
    writeMask: 0,
  }

  preProcess() {
    for (let i = 1; i <= 8; i++) {
      this.addInputHandler(`do${i}`, (data) => this.inputDo(i, data))
    }
  }

  /**
   * Установка адреса
  */
  async actionSetAddress(data: { value: number }) {
     await this.actionAddQueue(() => {
      return this.simpleRequest(0x06, 0x4000, data.value)
    })
    return { result: 'success' }
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
    await this.updateStatus(0x02, 0x08, 'inputMask', 'di')
    await this.updateStatus(0x01, 0x08, 'outputMask', 'do')
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
    for (let i = 0; i < 8; i++) {
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
    await this.simpleRequest(0x0F, 0x00, 0x08, this.n2ba(this.shares.writeMask))
  }

  /**
   * Преобразует число в массив бит
  */
  private n2ba(n: number): number[] {
    n &= 0xFF; // гарантируем 8-битное значение
    const bits: number[] = [];
    for (let i = 0; i < 8; i++) {
      bits.push((n >> i) & 1); // i-й бит (начиная с 0 — младшего)
    }
    return bits;
  }
}