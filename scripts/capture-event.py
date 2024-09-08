import paho.mqtt.subscribe as subscribe
import json
import csv
from datetime import datetime

broker = '127.0.0.1'
topic = 'milestone-communicate'


def on_message_print(client, userdata, message):
    payload = json.loads(message.payload)
    payload['timestamp'] = datetime.now()
    userdata['csvwriter'].writerow(payload)
    userdata["message_count"] += 1
    if userdata["message_count"] >= 1000:
        # it's possible to stop the program by disconnecting
        client.disconnect()


csvfile = open('event-data.csv', 'w', newline='')

fieldnames = ['timestamp', 'status',
              'camera_id', 'det', 'image_path', 'labels', 'preset_id', 'is_saved']
csvwriter = csv.DictWriter(csvfile, fieldnames=fieldnames)

csvwriter.writeheader()

subscribe.callback(on_message_print, topic, hostname=broker,
                   userdata={"message_count": 0, "csvwriter": csvwriter})

csvfile.close()
