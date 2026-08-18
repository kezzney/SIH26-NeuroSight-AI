"""
Model architecture — ported directly from braintumor2026.ipynb (SRIP 2026).

This file exists so app/services/inference.py can load the trained
E5_TwoStage_best.keras checkpoint. The AttentionLayer definition MUST
match the training notebook exactly (same class name, same build/call
logic) or Keras will fail to deserialize the saved weights.

Do not "clean up" or refactor this class independently of the notebook —
keep it byte-for-byte identical to Section 3 of braintumor2026.ipynb.
"""

import tensorflow as tf
from tensorflow.keras.layers import Layer

IMG_SIZE = 224           # confirmed from braintumor2026.ipynb Section 1 hyperparameters
NUM_CLASSES = 4          # glioma, meningioma, notumor, pituitary
CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]  # confirmed: CLASSES in notebook, alphabetical (sorted os.listdir order)


class AttentionLayer(Layer):
    """
    Custom Soft Attention Mechanism (ported verbatim from SRIP notebook).
    Computes a weighted sum of LSTM output sequences,
    where weights are learned during training.
    Input shape:  (batch, timesteps, features)
    Output shape: (batch, features)
    """

    def __init__(self, **kwargs):
        super(AttentionLayer, self).__init__(**kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(
            name='attention_W',
            shape=(input_shape[-1], 1),
            initializer='glorot_uniform',
            trainable=True)
        self.b = self.add_weight(
            name='attention_b',
            shape=(input_shape[1], 1),
            initializer='zeros',
            trainable=True)
        super(AttentionLayer, self).build(input_shape)

    def call(self, x):
        e = tf.keras.backend.tanh(
            tf.keras.backend.dot(x, self.W) + self.b)
        a = tf.keras.backend.softmax(e, axis=1)
        output = x * a
        return tf.keras.backend.sum(output, axis=1)

    def get_config(self):
        return super(AttentionLayer, self).get_config()


CUSTOM_OBJECTS = {"AttentionLayer": AttentionLayer}
