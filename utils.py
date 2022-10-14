import os
from PIL import Image
import numpy as np
import torch
from torch.utils.data import Dataset
from torch.nn.utils.rnn import pad_sequence


class Vocab:
    EOS = '<EOS>'
    SOS = '<SOS>'
    UNK = '<UNK>'

    def __init__(self, corpus_files):
        corpus = ""
        for corpus_file in corpus_files:
            corpus += open(corpus_file).read()
        self.word = [self.EOS, self.SOS, self.UNK]
        self.word += list(set(corpus.split()))
        self.index = {word: index for index, word in enumerate(self.word)}
        self.size = len(self.word)

    def decode(self, code):
        s = ""
        for token in code:
            if token == self.index[self.EOS]:
                break
            if token == self.index[self.SOS]:
                continue
            s += self.word[token]
            s += " "
        return s.strip()


class ImageLaTeXDataset(Dataset):
    def __init__(self, image_dir, formulas_file=None, transform=None):
        self.transform = transform
        self.image_dir = image_dir

        if formulas_file:
            self.formulas = open(formulas_file).readlines()
        else:
            self.formulas = None

        self.len = len(os.listdir(image_dir))

    def __len__(self):
        return self.len

    def __getitem__(self, i):
        image_file = os.path.join(self.image_dir, str(i) + '.jpg')
        image = np.array(resize_with_padding(Image.open(image_file), (2000, 2000)))
        #image=self.padding(image,2000,2000)
        if self.formulas:
            data = [image, self.formulas[i]]
        else:
            data = [image, self.formulas]

        if self.transform:
            data = self.transform(data)
        return data
    
    def padding(self,img, expected_size):
        desired_size = expected_size
        delta_width = desired_size - img.size[0]
        delta_height = desired_size - img.size[1]
        pad_width = delta_width // 2
        pad_height = delta_height // 2
        padding = (pad_width, pad_height, delta_width - pad_width, delta_height - pad_height)
        return ImageOps.expand(img, padding)


    def resize_with_padding(self,img, expected_size):
        img.thumbnail((expected_size[0], expected_size[1]))
        # print(img.size)
        delta_width = expected_size[0] - img.size[0]
        delta_height = expected_size[1] - img.size[1]
        pad_width = delta_width // 2
        pad_height = delta_height // 2
        padding = (pad_width, pad_height, delta_width - pad_width, delta_height - pad_height)
        return ImageOps.expand(img, padding)
    
    def padding(self,array, xx, yy):
        h = array.shape[0]
        w = array.shape[1]

        a = (xx - h) // 2
        aa = xx - a - h

        b = (yy - w) // 2
        bb = yy - b - w

        return np.pad(array, pad_width=((a, aa), (b, bb)), mode='constant')


class Tokenize:
    def __init__(self, vocab):
        self.vocab = vocab

    def __call__(self, data):
        if data[1]:
            tokens = [self.vocab.SOS] + data[1].split() + [self.vocab.EOS]
            data[1] = np.array(
                [
                    self.vocab.index[token]
                    if token in self.vocab.index
                    else self.vocab.index[self.vocab.UNK]
                    for token in tokens
                ]
            )
        else:
            data[1] = np.array([0])
        return data


class Normalize:
    def __call__(self, data):
        image = data[0]
        image = (image - 127.5) / 127.5
        data[0] = image
        return data


class ToTensor:
    def __call__(self, data):
        data[0] = torch.from_numpy(
            data[0].astype(np.float32)).view(1, *data[0].shape)
        data[1] = torch.from_numpy(data[1])
        return data


class PadSequence:
    def __call__(self, batch):
        images = torch.stack([data[0] for data in batch])
        formulas = pad_sequence([data[1] for data in batch],
                                batch_first=True)
        return images, formulas
