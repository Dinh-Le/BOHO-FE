# API DOCUMENTS FOR BohoV2
---
# Table of Contents
- [I. General API Information](#i-general-api-information)
    * [I.1 HTTP Return Codes](#i1-http-return-codes)
    * [I.2 GENERAL INFORMATION ON ENDPOINTS](#i2-general-information-on-endpoints)
- [II. Update Note](#ii-update-note)
    * [1. UPDATE NOTE (10/0/2021)](#1-update-note-10102021)
- [III. Code Return](#iii-code-return)
- [IV. API USAGE](#iv-api-usage)
    * [1 User Management API](#1-user-management-api)
    * [2 Node Management API](#2-node-management-api)
    * [3 Device Management API](#3-device-management-api)
    * [4 Camera Management API](#4-camera-management-api)
    * [5 Rule Management API](#5-rule-management-api)
    * [6 Object Configurate API](#6-object-configurate-management-api)
    * [7 Alarm Management API](#7-alarm-management-api)
    * [8. Device Configs Management API (Removed)](#8-device-configs-management-api-(remove)) 
    * [9. Health Check Monitor API](#9-health-check-monitor-api)
    * [10. Edge Controller API](#10-edge-controller-api)
    * [11. Milestone Intergrate](#11-milestone-intergrate)
----
## I General API Information

- The base endpoint is: http://192.168.0.55:5500
- All enpoints return eithere a JSON object, array or image in binary
- All time and timestampp related fields are follow Korea/Vietnam UTC time format
---
### I.1 HTTP Return Codes
- ```HTTP``` 400 return code are bad requests
- ```HTTP``` 401 return code are used for malformed requests, the issue is on the sender's side.
- ```HTTP``` 405 return code is unauthorized request
- ```HTTP``` 200 return code is used for successful request
- ```HTTP``` 201 return code is created successful request
-  ```HTTP``` 206 return code is  the request has succeeded and the body contains the requested ranges of data
- ```HTTP``` 5xx  return codes are used for internal errors; the issue is on server's side. It is important to NOT treat this as a failure operation
---
## I.2 GENERAL INFORMATION ON ENDPOINTS
- For ```GET``` endpoints, parameter mus be sent as a ```query string```
  
- For ```POST```, ```PUT``` and ```DELETE``` endpoints, the parameters may be sent as a ```query string``` or in ```request body``` with content type ```apllication/json```
- Paramaters may be sent in any order.
- If a parameter sent in both the ```query string``` and ```request body```, the ```query string``` parameter will be used.
---
## II UPDATE NOTE

### ```1. UPDATE NOTE (10/06/2022)```
- Implement CRUD APIs for User management module
- Implement CRUD APIs for Config management module
- Implement CRUD APIs for Node management module
- Implement CRUD APIs Device management module
- Implement Authorize process for all APIs

### ```2. UPDATE NOTE (20/07/2022)```
- Fixed create device error
- Updated delete method for Device & Node module
- Updated config structure module
- Updated node structure module
- Added new field data into Node table
- Updated document information
- Remove **type** field in Configure module

### ```3. UPDATE NOTE (27/07/2022)```
- Change API structure of create & update configuration for devices
- Fix some minor errors in API documents
- Update API to query detail information of node

### ```4. UPDATE NOTE(08/08/2022)```
- Re-design dataflow of create & update configurtion for devices
- Add new datafield ***preset_name*** into device configuration table
- create auto get preset information from camera
- Create sync function to map infomration from PTZ camera to device
- Add new API to get single camera configuration
- Add new snapshot API
- Add new datafield ***user and password*** into device metadata

### ```5. UPDATE NOTE(09/08/2022)```
- Update structure of snapshot API
- Update define datafield of configure 

### ```6. UPDATE NOTE(31/08/2022)```
- Modify DeviceConfiguration CRUD
- Change device configure data request structure

### ```7. UPDATE NOTE(27/09/2022)```
- Update DeviceConfiguration rules when create config
- Fix API bugs
- Add Edge Controller API
- Add send/update configurate for Edge
- Add start/stop Edge system
- Add new data field for saving PTZ events

### ```8. UPDATE NOTE(23/05/2023)```
- Implement CRUD APIs for Rule & Object configurate module
- Implement CRUD APIs for Calibrate & Alarm manager module
- Remove Device Confiugration table
- Re-factor foreign key between Track, Alarm, and Device tables
- Update Device and Node key information
- Re-factor requests APIs 

### ```9. UPDATE NOTE(31/05/2023)```
- Update Rule module APIs request
- Update Alarm module APIs request
- Update database construction

#### ```10. UDATE NODE(27/06/2023)```
- Implement Milestone Intergrate Module
- Update Rule request and attribute
- Update database construction

#### ```11. UDATE NODE(21/07/2023)```
- Update Rule, Alarm, and Object management request APIs
- Update attribute names of Object management APIs
- Add VMS nodes type
- Add VMS sycn API
- Update node_metadata of node management APIs
- Update snapshot support function on PTZ and Static cameras
- Update database construction

---
## III. CODE RETURN

> code ```1000```: Request Done
> 
> code ```1001```: Request Fail
> 
> code ```1002```: Data is invalid in database
> 
> code ```1003```: Video is processing
>
> code ```1004```: Partial or empty data return
> 
> code ```1005```: Unauthorize return
----
## IV. API USAGE
----
## **1 User Management API**


#### ADD USER

- Create POST request to create new user( only admin user can add the user)
```
POST /api/rest/v1/user/add_user
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
  "name" : "str",
	"role" : "str",
	"password": "str"
}

Response: {
  "message": "str",
  "success": "boolean"
}


```

*```Note```: The password rule: password must contain both lower and upper letter and at least special sysbol is required (!,@,#,$,%,^,&,*)

---
#### GET USERS

- Create GET request to get the list of user( only admin user can use this function)
```
POST /api/rest/v1/user/get_users
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "message": "str",
  "data": [{
    "id": "str",
    "name" : "str",
    "email": "str"
  }],
  "success": "boolean"
}


```
---
#### LOGIN
- Create POST request to login the system
```
POST /api/rest/v1/login
```

```
Request Header
Authorization: No
Type: application/json
```

```json
Request: {
    "name" : "str",
	"password": "str"
}

Response: {
  "data": "str", //authorize token
  "message": "str",
  "success": "boolean"
}

```
*```Note```: Each token will have expired time 24 hours. After 24 hours the user will need to login again to access another APIs*

---
#### CHANGE PASSWORD

- Create POST request to change the password of user (current user or admin user can update the password)
```
POST /api/rest/v1/user/update_password
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
    "user_id" : "str", //only require when change by admin user
	"password": "str"
}

Response: {
  "message": "str",
  "success": "boolean"
}
```
---
#### UPDATE ROLE

- Create POST request to change the role of user ( admin user can update the password)
```
POST /user/update_role
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
    "user_id" : "str",
	"role": "str"
}

Response: {
  "message": "str",
  "success": "boolean"
}
```
---
## **2 Node Management API**

#### ADD NODE

- Create POST request to create edge device ( only admin user can create node)
```
POST /api/rest/v1/node
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
    "location" : {
        "lat": "str",
        "lon": "str",
    },
    "name": "str",
    "type": "str", /// DeepStream or TensortRT or Milestone
    "ip": "str",
    "node_metadata": {
      "user" : "str", /// Not required only for VMS
      "password" : "str", /// Not required only for VMS
      "end_point": "str" /// Not required only for VMS
    },
    "connection_metadata": {
        "kafka" : {
            "port": "str",
            "topic": "str"
            
        },
        "mqtt": {
            "port": "str",
            "topic": "str"
        },
        "socket": {
            "port": "str"
        }
    },
    "engine_metadata" : {
      "resolution" : {
        "width" : "int",
        "height" : "int"
      },
      "frame_rate" : "int", // Maximum value is 30
      "sensitive": {
        "detection" : "int", //Range value from 1 to 5
        "tracking" : "int" //Range value from 1 to 5
      },
      "frame_step" : "int"
    }
    }

Response: {
  "message": "str",
  "success": "boolean"
}
```
----

#### GET NODES
- Create GET request to get the list of nodes
```
GET /api/rest/v1/nodes
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response:{
  "data": {
    "code": 1000,
    "data": [
      {
          "node_id": "str",
          "location" : {
              "lat": "str",
              "lon": "str",
          },
          "name": "str",
          "type": "str", /// DeepStream or TensortRT
          "ip": "str",
          "node_metadata": {
            "user" : "str", /// Not required only for VMS
            "password" : "str", /// Not required only for VMS
            "end_point": "str" /// Not required only for VMS
          },
          "connection_metadata": {
              "kafka" : {
                  "port": "str",
                  "topic": "str"
                  
              },
              "mqtt": {
                  "port": "str",
                  "topic": "str"
              },
              "socket": {
                  "port": "str"
              }
          },
          "engine_metadata" : {
            "resolution" : {
              "width" : "int",
              "height" : "int"
            },
            "frame_rate" : "int", // Maximum value is 30
            "sensitive": {
              "detection" : "int", //Range value from 1 to 5
              "tracking" : "int" //Range value from 1 to 5
            },
            "frame_step" : "int"
          }
      }
    ],
    "message": "str"
  },
  "message": "str",
  "success": false
}
```
---
#### GET NODE IN DETAIL
- Create GET request to get the  node information
```
GET /api/rest/v1/nodes/<node_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response:{
  "data": {
    "code": 1000,
    "data": 
      {
          "node_id": "str",
          "location" : {
              "lat": "str",
              "lon": "str",
          },
          "name": "str",
          "type": "str", /// DeepStream or TensortRT
          "ip": "str",
          "node_metadata": {
            "user" : "str", /// Not required only for VMS
            "password" : "str", /// Not required only for VMS
            "end_point": "str" /// Not required only for VMS
          },
          "connection_metadata": {
              "kafka" : {
                  "port": "str",
                  "topic": "str"
                  
              },
              "mqtt": {
                  "port": "str",
                  "topic": "str"
              },
              "socket": {
                  "port": "str"
              }
          },
          "engine_metadata" : {
            "resolution" : {
              "width" : "int",
              "height" : "int"
            },
            "frame_rate" : "int", // Maximum value is 30
            "sensitive": {
              "detection" : "int", //Range value from 1 to 5
              "tracking" : "int" //Range value from 1 to 5
            },
            "frame_step" : "int"
          }
      }
    ,
    "message": "str"
  },
  "message": "str",
  "success": false
}
```
---

#### UPDATE NODE INFO

- Create PATCH request to update node information
```
PATCH /api/rest/v1/node/<node_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
	"node_id" : "str",
    "location" : {
        "lat": "str",
        "lon": "str",
    },
    "name": "str",
    "type": "str", /// DeepStream or TensortRT
    "ip": "str",
    "node_metadata": {
      "stream_port" : "str",
      "stream_url" : "str",
      "image_stream_url": "str",
      "imaeg_stream_port" : "str"
    },
    "connection_metadata": {
        "kafka" : {
            "port": "str",
            "topic": "str"
            
        },
        "mqtt": {
            "port": "str",
            "topic": "str"
        },
        "socket": {
            "port": "str"
        }
    },
    "engine_metadata" : {
      "resolution" : {
        "width" : "int",
        "height" : "int"
      },
      "frame_rate" : "int", // Maximum value is 30
      "sensitive": {
        "detection" : "int", //Range value from 1 to 5
        "tracking" : "int" //Range value from 1 to 5
      },
      "frame_step" : "int"
    }
}

Response: {
  "message": "str",
  "success": "boolean"
}
```
---
#### DELETE NODE

- Create DELETE request to delete node information
```
DELETE /api/rest/v1/node/<node_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {},
  "message" : "str",
  "success" : "boolean"
}
```

---
#### SYNC NODE INFORMATION (SUPPORT VMS ONLY)

- Create POST request to synchoize VMS information with other node
```
POST /api/rest/v1/node/<node_id>/sync
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
  "node_id" : "str" /// Select the node that user want to sync with
}

Response: {
  "data": {},
  "message" : "str",
  "success" : "boolean"
}
```

---
### 3. Device Management API

#### CREATE DEVICE

- Create POST request to create new device( only admin user can add the user)
```
POST /api/rest/v1/node/<node_id>/device
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
	"device_metadata" : {
        "ip" : "str",
        "http_port" : "str",
        "rtsp_port" : "str",
        "user" : "str", // In case camera dont have security step let it empty
        "password": "str" // In case camera dont have security step let it empty
    },
    "location" : {
        "lat" : "str",
        "long" : "str"
    },
    "type" : "str", // Device Type : Camera, Radar , ....
    "region" : "str"
}

Response: {
  "data": "str", //device_id
  "message": "str",
  "success": "boolean"
}


```
----
#### GET DEVICES LIST
- Create GET request to get the list of devices
```
GET /api/rest/v1/node/<node_id>/devices
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response:{
  "data": [{
  "device_id" : "str",
	"device_metadata" : {
        "ip" : "str",
        "http_port" : "str",
        "rtsp_port" : "str",
        "user" : "str", // In case camera dont have security step let it empty
        "password": "str" // In case camera dont have security step let it empty
    },
    "location" : {
        "lat" : "str",
        "long" : "str"
    },
    "type" : "str", // Device Type : Camera, Radar , ....
    "region" : "str"
  }],
    "message" : "str",
    "success" : "boolean"
}
```
----
#### GET DEVICE

- Create GET request to get current device information
```
GET /api/rest/v1/node/<node_id>/device/<device_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {
  "device_id" : "str",
	"device_metadata" : {
        "ip" : "str",
        "http_port" : "str",
        "rtsp_port" : "str",
        "user" : "str", // In case camera dont have security step let it empty
        "password": "str" // In case camera dont have security step let it empty
    },
    "location" : {
        "lat" : "str",
        "long" : "str"
    },
    "type" : "str", // Device Type : Camera, Radar , ....
    "region" : "str"
  },
    "message" : "str",
    "success" : "boolean"
}
```
----
#### EDIT DEVICE

- Create PATCH request to edit the current device( only admin user can add the device)
```
PATCH /api/rest/v1/node/<node_id>/device/<device_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
	"device_metadata" : {
        "ip" : "str",
        "http_port" : "str",
        "rtsp_port" : "str",
        "user" : "str", // In case camera dont have security step let it empty
        "password": "str" // In case camera dont have security step let it empty
    },
    "location" : {
        "lat" : "str",
        "long" : "str"
    },
    "type" : "str", // Device Type : Camera, Radar , ....
    "region" : "str"
}

Response: {
  "message": "str",
  "success": "boolean"
}
```
---
#### DELETE DEVICE

- Create DELETE request to delete device information
```
DELETE /api/rest/v1/node/<node_id>/device/<device_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {},
  "message" : "str",
  "success" : "boolean"
}
```



---
### 4. Camera Management API

#### CREATE CAMERA

- Create POST request to create new camera( only admin user can add the user)
```
POST /api/rest/v1/node/<node_id>/device/<device_id>/camera
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
	"stream_metadata" : {
        "milestone_id" : "str",
        "milestone_url" : "str",
        "is_onvif" : "bool"
    }, // Not need to define this field when create request
    "manufacture" : "str", //Camera name (Flexwatch, Hanwha, Sony,...)
    "source_pos" : "int", // The position of camera on grid
    "type" : "str" // Camera type (PTZ,Static)
}

Response: {
  "data": "str", //camera_id
  "message": "str",
  "success": "boolean"
}


```
----
#### GET CAMERAS LIST
- Create GET request to get the list of cameras
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/cameras
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response:{
  "data": [{
  "camera_id" : "str",
	"stream_metadata" : {
        "milestone_id" : "str",
        "milestone_url" : "str",
        "is_onvif" : "bool"
    },
    "manufacture" : "str", //Camera name (Flexwatch, Hanwha, Sony,...)
    "source_pos" : "int", // The position of camera on grid
    "type" : "str" // Camera type (PTZ,Static)
  }],
    "message" : "str",
    "success" : "boolean"
}
```
----
#### GET CAMERA

- Create GET request to get current camera information
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {
  "camera_id" : "str",
	"stream_metadata" : {
        "milestone_id" : "str",
        "milestone_url" : "str",
        "is_onvif" : "bool"
    }, 
    "manufacture" : "str", //Camera name (Flexwatch, Hanwha, Sony,...)
    "source_pos" : "int", // The position of camera on grid
    "type" : "str" // Camera type (PTZ,Static)
  },
    "message" : "str",
    "success" : "boolean"
}
```
----
#### EDIT CAMERA

- Create PATCH request to edit the current camera
```
PATCH /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
	"stream_metadata" : {
        "milestone_id" : "str",
        "milestone_url" : "str",
        "is_onvif" : "bool"
    } , 
    "manufacture" : "str", //Camera name (Flexwatch, Hanwha, Sony,...)
    "source_pos" : "int", // The position of camera on grid
    "type" : "str" // Camera type (PTZ,Static)
}

Response: {
  "message": "str",
  "success": "boolean"
}
```
---
#### DELETE CAMERA

- Create DELETE request to delete device information
```
DELETE /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {},
  "message" : "str",
  "success" : "boolean"
}
```

---
#### SNAPSHOT


- Create GET request to download the image information
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/cameras/<camera_id>/snapshot
```

```
Request Header
Authorization: Bearer
Type: application/json
```
- Request Parameters:
    - ***rule_id*** : define the rule id to get the current snapshot from database (optional)
    - ***preset_id*** : define the preset_id to get the snapshot from current time (optional) - (In case of Static camera, set preset_id  = 1)
```json

Response: {
  "message": "str",
  "success": "boolean",
  "data": {
    "size": "list", /// [width,height]
    "format" : "str",
    "img" : "str" // image data
  }
}
```
- Example Usage
```python
import base64
imgdata = base64.b64decode(res['data']['img'])
filename = 'some_image.jpg' 
with open(filename, 'wb') as f:
    f.write(imgdata)
```

---
### 5. Rule Management API

#### CREATE RULE

- Create POST request to create new rule( only admin user can add the user)
```
POST /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule
```

```
Request Header
Authorization: Bearer
Type: application/json
```
- For static camera

```json
Request: None

Response: {
  "data": "str", //rule_id
  "message": "str",
  "success": "boolean"
}


```
- For PTZ camera:


```json
Request: {
    "preset_name" : "str",
    "preset_id" : "int",
    "tour_level": "int", /// The value use to define the level appearance and runing during touring time. For example : if the preset have rule 1 will be process before rule number 2
    "tour_group": "int" /// The touring group for each camera. All rule have same group will be toured follow by level
}

Response: {
  "data": "str", //rule_id
  "message": "str",
  "success": "boolean"
}


```
----
#### GET RULE LIST
- Create GET request to get the list of rules
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rules
```

```
Request Header
Authorization: Bearer
Type: application/json
```

- For static camera

```json
Request: None

Response:{
  "data": {
  "rule_id" : "str",
	"snapshot" : "str",
  "tour_level" : null,
  "tour_group" : null,
  "camera_id": "str"
  },
    "message" : "str",
    "success" : "boolean"
}
```

- For PTZ camera

```json
Request: None

Response:{
  "data": {[
  "rule_id" : "str",
	"snapshot" : "str",
  "tour_level" : "int",
  "tour_group" : "int",
  "preset" : {
    "pan": "int",
    "tilt": "int",
    "zoom": "int",
    "preset_name": "str",
    "preset_id" : "int"
  },
  "camera_id": "str"
  ]},
    "message" : "str",
    "success" : "boolean"
}
```

----
#### GET RULE

- Create GET request to get current rule information
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```
- For static camera

```json
Request: None

Response:{
  "data": {
  "rule_id" : "str",
	"snapshot" : "str",
  "tour_level" : null,
  "tour_group" : null,
  "camera_id": "str"
  },
    "message" : "str",
    "success" : "boolean"
}
```

- For PTZ camera

```json
Request: None

Response:{
  "data": {
  "rule_id" : "str",
	"snapshot" : "str",
  "tour_level" :"int",
  "tour_group" : "int",
  "preset" : {
    "pan": "int",
    "tilt": "int",
    "zoom": "int",
    "preset_name": "str",
    "preset_id" : "int"
  },
  "camera_id": "str"
  },
    "message" : "str",
    "success" : "boolean"
}
```
----
#### EDIT RULE

- Create PATCH request to edit the current rule
```
PATCH /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

- For static camera

```json
Request: None

Response: {
  "message": "str",
  "success": "boolean"
}


```
- For PTZ camera:


```json
Request: {
    "preset_name" : "str",
    "preset_id" : "int",
    "tour_level" : "int",
    "tour_group" : "int"
}

Response: {
  "message": "str",
  "success": "boolean"
}


```

---
#### DELETE RULE

- Create DELETE request to delete rule information
```
DELETE /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {},
  "message" : "str",
  "success" : "boolean"
}
```

#### UPLOAD SNAPSHOT

- Create GET request to get snapshot image 
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: img_data (str base64 format)
```

---
### 6 .Object Configurate API

#### CREATE OBJECT CONFIGURE

- Create POST request to create new object configure
```
POST /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/object
```

```
Request Header
Authorization: Bearer
Type: application/json
```


```json
Request: {
    "name" : "str", // the object name should be in one of defined class ["people","car", "truck", "ambulance"]
    "min_speed" : "int",
    "max_speed" : "int",
    "describe" : "str", // Not required this field when create
    "meta_data" : "str" // Not required this field when create
}

Response: {
  "data": "str", //object_id
  "message": "str",
  "success": "boolean"
}


```
----
#### GET OBJECT LIST
- Create GET request to get the list of objects
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/objects
```

```
Request Header
Authorization: Bearer
Type: application/json
```


```json
Request: None

Response:{
  "data": {[
  "rule_id" : "str",
  "name" : "str", // the object name should be in one of defined class ["people","car", "truck", "ambulance"]
  "min_speed" : "int",
  "max_speed" : "int",
  "describe" : "str", // Not required this field when create
  "meta_data" : "str", // Not required this field when create
  "object_id": "str"
  ]},
    "message" : "str",
    "success" : "boolean"
}
```

----
#### GET OBJECT

- Create GET request to get current rule information
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/object/<object_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```


```json
Request: None

Response:{
  "data": {
  "rule_id" : "str",
  "name" : "str", // the object name should be in one of defined class ["people","car", "truck", "ambulance"]
  "min_speed" : "int",
  "max_speed" : "int",
  "describe" : "str", // Not required this field when create
  "meta_data" : "str", // Not required this field when create
  "object_id": "str"
  },
    "message" : "str",
    "success" : "boolean"
}
```
----
#### EDIT OBJECT

- Create PATCH request to edit the current rule
```
PATCH /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/object/<object_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```



```json
Request: {
    "name" : "str", // the object name should be in one of defined class ["people","car", "truck", "ambulance"]
    "min_speed" : "int",
    "max_speed" : "int",
    "describe" : "str", // Not required this field when edit
    "meta_data" : "str" // Not required this field when edit
}

Response: {
  "message": "str",
  "success": "boolean"
}


```

---
#### DELETE OBJECT

- Create DELETE request to delete object information
```
DELETE /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/object/<object_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {},
  "message" : "str",
  "success" : "boolean"
}
```

---
### 7. Alarm Management API

#### CREATE ALARM MANAGEMENT

- Create POST request to create new alarm( only admin user can add the user)
```
POST /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/alarm
```

```
Request Header
Authorization: Bearer
Type: application/json
```


```json
Request: {
    "points" : "list", // the list of points
    "level" : "int",
    "alarm_type" : "str", // Type of Alarm, it should be in Defined type
    "schedule" {
      "start_time" : "str", // Data format hour:min:second
      "end_time" : "str" // Data format hour:min:second
    }
}

Response: {
  "data": "str", //alarm_id
  "message": "str",
  "success": "boolean"
}


```
----
#### GET ALARM LIST
- Create GET request to get the list of objects
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/alarms
```

```
Request Header
Authorization: Bearer
Type: application/json
```


```json
Request: None

Response:{
  "data": {[
  "rule_id" : "str",
  "alarm_id": "str",
  "alarm_management_id" : "str", // Use this id for other alarm request
  "points" : "list", // the list of points
  "level" : "int",
  "schedule" {
    "start_time" : "str", // Data format hour:min:second
    "end_time" : "str" // Data format hour:min:second
  }
  ]},
    "message" : "str",
    "success" : "boolean"
}
```

----
#### GET ALARM

- Create GET request to get current rule information
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/alarm/<alarm_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```


```json
Request: None

Response:{
  "data": {
  "rule_id" : "str",
  "alarm_id": "str",
  "alarm_management_id" : "str", // Use this id for other alarm request
  "points" : "list", // the list of points
  "level" : "int",
  "schedule" {
    "start_time" : "str", // Data format hour:min:second
    "end_time" : "str" // Data format hour:min:second
  }
  },
    "message" : "str",
    "success" : "boolean"
}
```
----
#### EDIT OBJECT

- Create PATCH request to edit the current rule
```
PATCH /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/alarm/<alarm_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```



```json
Request: {
    "points" : "list", // the list of points
    "level" : "int",
    "schedule" {
      "start_time" : "str", // Data format hour:min:second
      "end_time" : "str" // Data format hour:min:second
    }
}

Response: {
  "message": "str",
  "success": "boolean"
}


```

---
#### DELETE ALARM

- Create DELETE request to delete object information
```
DELETE /api/rest/v1/node/<node_id>/device/<device_id>/camera/<camera_id>/rule/<rule_id>/alarm/<alarm_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "data": {},
  "message" : "str",
  "success" : "boolean"
}
```

---
### 8. Device Configs Management API (Removed)

#### ADD DEVICE CONFIG

- Create POST request to create device configs ( only admin user can do this function)
```
POST /api/rest/v1/node/<node_id>/device/<device_id>/config
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
    "analytic_objects" : "list",
    "alarm_type" : "str",
    "points" : "list",
    "preset_name": "str", /// Only add this field if the camera is PTZ
    "preset_id" : "int" /// Only add this field if the camera is PTZ
}

Response: {
  "message": "str",
  "success": "boolean"
}
```

*```Note```*:
   - preset metadata only be created when device type is PTZ
   - preset id must be in integer type range from 1 to 256
   - preset name must start with BG(Background) or EZ(Event Zone). 
      - If preset name start with BG, the rule will be: BG-BG number ( Background number can from 0 to 6)
      - If preset name start with EZ, the rule will be: EZ- BG number - piority number ( Piority number can from 0 to 6)
   - alarm type must be one of type below:
        - Detection Alarm: This is for normal event happend. Cannot use in when preset in background zone
        - Tripwire Alarm: This is for tripwire event. Cannot use in when preset in background zone
        - Trespassing Alarm: This is for trespassing event. Cannot use in when preset in background zone
        - Loitering Alarm: This is for loitering event. Cannot use in when preset in background zone
        - No Alarm: This case is used when no event happend

----
#### GET DEVICE CONFIG
- Create GET request to get many configs of one device
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/configs
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response:{
  "data": {
    "code": 1000,
    "data": [{
    "analytic_objects" : "list",
    "alarm_type" : "str",
    "points" : "list",
    "pan" : "int",  // None when the device type is Camera Static
    "tilt" : "int", // None when the device type is Camera Static
    "zoom" : "int", // None when the device type is Camera Static
    "preset_name" : "str", // None when the device type is Camera Static
    "preset_id" : "int" // None when the device type is Camera Static

  }]},
  "message": "str",
  "success": "boolean"
}
```
---
#### GET SINGLE DEVICE CONFIG
- Create GET request to get config
```
GET /api/rest/v1/node/<node_id>/device/<device_id>/config/config_id
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response:{
  "data": {
    "code": 1000,
    "data": {
    "analytic_objects" : "list",
    "alarm_type" : "str",
    "points" : "list",
    "pan" : "int",  // None when the device type is Camera Static
    "tilt" : "int", // None when the device type is Camera Static
    "zoom" : "int", // None when the device type is Camera Static
    "preset_name" : "str", // None when the device type is Camera Static
    "preset_id" : "int" // None when the device type is Camera Static

  },
  "message": "str",
  "success": "boolean"
}
```
---
#### UPDATE DEVICE CONFIG


- Create PATCH request to update device config ( only admin user can do this function)
```
PATCH /api/rest/v1/node/<node_id>/device/<device_id>/config/<config_id>
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: {
        "alarm_type" : "list",
        "points" : "list",
        "analytic_objects" : "list",
        "preset_id" : "int", /// Only add this field if the camera is PTZ
        "preset_name" : "str" /// Only add this field if the camera is PTZ
}

Response: {
  "message": "str",
  "success": "boolean"
}
```

*```Note```*:
   - preset metadata only be created when device type is PTZ
   - preset id must be in integer type range from 1 to 256
   - preset name must start with BG(Background) or EZ(Event Zone). 
      - If preset name start with BG, the rule will be: BG-BG number ( Background number can from 0 to 6)
      - If preset name start with EZ, the rule will be: EZ- BG number - piority number ( Piority number can from 0 to 6)
   - alarm type must be one of type below:
        - Detection Alarm: This is for normal event happend. Cannot use in when preset in background zone
        - Tripwire Alarm: This is for tripwire event. Cannot use in when preset in background zone
        - Trespassing Alarm: This is for trespassing event. Cannot use in when preset in background zone
        - Loitering Alarm: This is for loitering event. Cannot use in when preset in background zone
        - No Alarm: This case is used when no event happend
---
### 9. Health Check Monitor API


#### GET DEVICE INFORMATION

- Create GET request to get the current information of the AI server
```
GET /api/rest/v1/health
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response:{
  "data": {
      "processor" : {
          "physicals" : "int",
          "logicals" : "int",
          "usage" : "str", //percent value per cpu
          "usages" : "str" //whole cpu
      },
      "memory" : {
          "total" : "int",
          "available" : "int",
          "used" : "int",
          "free" : "int",
          "percent" : "str"
      },
      "storage" : {
        "total" : "int",
        "available" : "int",
        "used" : "int",
        "free" : "int",
        "percent" : "str"
      }
   },
    "message": "str"
  },
  "message": "str",
  "success": "boolean"
}
```
---
### 10. Edge Controller API


#### Upload Edge configuration

- Create POST request to upload configuration
```
POST /api/rest/v1/node/<node_id>/uploadConfig
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "message": "str",
  "success": "boolean"
}
```
-------------
#### Start Edge System

- Create GET request to start edge system

```
GET /api/rest/v1/node/<node_id>/start
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "message": "str",
  "success": "boolean"
}
```
------------
#### Stop Edge System

- Create GET request to stop edge system

```
GET /api/rest/v1/node/<node_id>/stop
```

```
Request Header
Authorization: Bearer
Type: application/json
```

```json
Request: None

Response: {
  "message": "str",
  "success": "boolean"
}
```

---
### 11. Milestone Intergrate


#### Camera Control Command

- Create POST request to control camera from server side
```
POST /api/rest/v1/milestone
```

```
Request Header
Authorization: Bearer
Type: application/json
```
* Parameter


Parameter | Type/Value | Description | Notes
--- | ---- | --- | ----
ms_uid | String | Milestone UID of camera | The database inside the milestone
command  | String | The command request | The command type allow : ENABLE CAMERA, DISABLE CAMERA


```json
Request: {
  "ms_uid" : "str", /// The milestone UID from milestone
  "command" : "str", /// The command that milestone want to process on camera
}

Response: {
  "message": "str",
  "success": "boolean"
}
```

