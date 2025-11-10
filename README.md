# VRack2 Other RTU

Набор для разных ModBusRTU устройств

## Установка

Перед установкой необходимо установить так же:

 - [vrack2-net](https://github.com/VRack2/vrack2-net) - Для работы с преобразователями и **TCPProvider**
 - [vrack2-modbus](https://github.com/VRack2/vrack2-modbus) - Для упращенной работы с ModbusRTU/TCP устройствами

Клонируем в директорию устройств (по умолчанию /opt/vrack2-service/devices)

```
cd /opt/vrack2-service/devices/
git clone https://github.com/VRack2/vrack2-other-rtu
```

----------

На данный момент все устройства не протестированны достаточно хорошо, но уже сейчас могут служить основой ваших устройств.

----------

## Текущий список устройств: 

 - [Ebyte AXCX4040](./docs/AXCX4040.pdf) - Модуль ввода вывода 4DI + 4DO
 - GTTH01 - Простой датчик температуры влажности типа XY-MD-02 
 - [SNYUXN01H](./docs/SNYUXN01H.pdf) - Датчик дождя и снега с подогревом
 - [Waveshare8D](./docs/Waveshare8D.pdf) - Модуль ввода вывода 8DI + 8DO

## Связанные репозитории

- [VRack2](https://github.com/VRack2/vrack2) - фреймворк для автоматизации и управления сервисами
- [VRack2-Service](https://github.com/VRack2/vrack2-service) — запуск сервисов на базе VRack2-Core.
- [VRack2-Core](https://github.com/VRack2/vrack2-core) — фреймворк для событийно-ориентированных сервисов на JavaScript/TypeScript.
- [VGranite](https://github.com/VRack2/VGranite) — сервис для организации туннелей Socket → Serial.
- [VRack2-Remote](https://github.com/VRack2/vrack2-remote) - библиотека для работы с VRack2 API
