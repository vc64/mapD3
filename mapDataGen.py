import pandas as pd
import numpy as np
import random

open_path = "50m.tsv"
df = pd.read_csv(open_path, sep="\t")   

print(df)

timedata = pd.DataFrame({})

for i in range(10):

    curr_arr = []
    for c in range(241):
        hexcode = hex(random.randint(0, 16 ** 6 - 1))
        curr_arr.append("#" + hexcode[2:])

    print(i)
    currdata = pd.DataFrame({"day" + str(i): curr_arr})
    timedata = pd.concat([timedata, currdata], axis=1)
# dat2 = pd.DataFrame({'dat2': [7,6]})
# dat1.join(dat2)

out = pd.concat([df, timedata], axis = 1)

print(out)

# change this VVV
# out = pd.DataFrame(np.random.randint(0,10,(200,100)))
out_path = "edited_50m.tsv"
out.to_csv(out_path, index=False, sep="\t")
