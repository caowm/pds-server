HL7 医疗设备数据共享服务器

使用HL7协议实现和迈瑞医疗设备相连.
接收的设备数据暂存pds.db--sqlite数据库.
设备数据根据应用需求传输到第3方应用数据库.
设备数据通过socket.io进行分发.
主动连接设备，设备断开自动重连.
基于strapi-3.
