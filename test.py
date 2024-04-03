from keras.models import load_model

# Load the trained model from the .h5 file
model = load_model('saved_trained_model_2.h5')

# Get the output layer of the model
output_layer = model.layers[-1]

# Extract the number of classes from the output layer
num_classes = output_layer.output_shape[1]

# Define placeholder class names
class_names = [f'class_{i+1}' for i in range(num_classes)]

# Alternatively, if you have access to the dataset or training code, you can retrieve the actual class names
# class_names = ['class_1', 'class_2', ...]

print("Class Names:", class_names)
