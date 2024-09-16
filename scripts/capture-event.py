import paho.mqtt.subscribe as subscribe
import json
import csv
from datetime import datetime

broker = '127.0.0.1'
topic = 'milestone-communicate'
camera_ids = ['98']


def on_message_print(client, userdata, message):
    payload = json.loads(message.payload)

    if payload['status'] != 'real_time_event':
        return

    if payload['camera_id'] not in camera_ids:
        return

    payload['timestamp'] = datetime.now()
    objects = [payload['labels'][int(det[5])] for det in payload['det']]
    payload['detected_objects'] = objects
    print(f'{payload["timestamp"]} - detected objects: {objects}')

    userdata['csvwriter'].writerow(payload)
    userdata["message_count"] += 1
    if userdata["message_count"] >= 100:
        # it's possible to stop the program by disconnecting
        client.disconnect()


csvfile = open('event-data.csv', 'w', newline='')

fieldnames = ['timestamp', 'status',
              'camera_id', 'detected_objects', 'det', 'image_path', 'labels', 'preset_id', 'is_saved']
csvwriter = csv.DictWriter(csvfile, fieldnames=fieldnames)

csvwriter.writeheader()

subscribe.callback(on_message_print, topic, hostname=broker,
                   userdata={"message_count": 0, "csvwriter": csvwriter})

csvfile.close()
