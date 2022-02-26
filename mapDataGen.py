import pandas as pd
import numpy as np
import random
import json

open_path1 = "50m.tsv"
df1 = pd.read_csv(open_path1, sep="\t")   

open_path2 = "gdp_total_billion_2020.csv"
df2 = pd.read_csv(open_path2, sep=",")   


print(df1["iso_n3"], df1["sovereignt"])

# # print(df2["Country Name"])

# tmp = pd.Series(list(set(df1["sovereignt"]).symmetric_difference(set(df2["Country Name"]))))

# print(tmp)

f = open('50m.json')

# returns JSON object as
# a dictionary
data = json.load(f)

print(data["objects"]["countries"]["properties"])

"""
timedata = pd.DataFrame({})

for i in range(1, 11):

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

"""
