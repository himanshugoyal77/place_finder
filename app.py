from flask import Flask, request, jsonify
import requests
import tensorflow as tf
import matplotlib.pyplot as plt
import numpy as np
from tensorflow.keras.models import load_model 
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
from flask_cors import CORS
 
app = Flask(__name__)

CORS(app)



# Function to import an image and resize it
# def load_and_prep_image(image_url, img_shape=300):
#     # Fetch image from URL
#     response = requests.get(image_url)
#     img = tf.image.decode_image(response.content, channels=3)
#     img = tf.image.resize(img, size=[img_shape, img_shape])
#     img = img / 255.
#     return img
def load_and_prep_image(image_url, img_shape=300):
    # Fetch image from URL
    response = requests.get(image_url)
    image_data = response.content
    image_format = response.headers.get('content-type')  # Get the image format from the response headers

    # Check if the image format is supported
    if image_format not in ['image/jpeg', 'image/png', 'image/gif', 'image/bmp']:
        return None  # Return None if the image format is not supported

    # Decode the image data based on the image format
    img = tf.image.decode_image(image_data, channels=3)

    # Resize the image
    img = tf.image.resize(img, size=[img_shape, img_shape])
    img = img / 255.
    return img

# Function to make predictions and plot the result
def pred_and_plot(model, image_url, class_names):
    print("model", model)
    img = load_and_prep_image(image_url)
    if img is None:
        return "Invalid image URL or image format"
    pred = model.predict(tf.expand_dims(img, axis=0))
    
    if len(pred[0]) > 1:
        pred_class = class_names[pred.argmax()]
    else:
        pred_class = class_names[int(tf.round(pred)[0][0])]
    
    return pred_class

# Example class names (modify according to your model)
class_names = ['Ajanta Caves', 'Charar-E- Sharif', 'Chhota_Imambara',
       'Ellora Caves', 'Fatehpur Sikri', 'Gateway of India',
       'Humayun_s Tomb', 'India gate pics', 'Khajuraho',
       'Sun Temple Konark', 'alai_darwaza', 'alai_minar',
       'basilica_of_bom_jesus', 'charminar', 'golden temple',
       'hawa mahal pics', 'iron_pillar', 'jamali_kamali_tomb',
       'lotus_temple', 'mysore_palace', 'qutub_minar', 'tajmahal',
       'tanjavur temple', 'victoria memorial']

# Load your model here (replace 'model' with your loaded model)
# model = load_model("saved_trained_model_2.h5")
model = load_model("saved_trained_model_2.h5", 
                   compile=False)
# Recompile with desired optimizer and metrics
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

@app.route('/')
def home():
    return 'Image Classification API'

@app.route('/predict', methods=['POST'])
def predict():
    # Get image URL from request
    image_url = request.json['image_url']
    print("image_url", image_url)
    # Perform prediction
    prediction = pred_and_plot(model, image_url, class_names)
    # Return prediction
    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True)
