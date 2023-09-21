import sys
import subprocess
import srs


def parse_smt_result(filename):
    coefficients = {}

    with open(filename) as f:
        data = f.read().split('\n')

        if data[0] == 'unsat':
            print('SRS is not terminating.')
            return

        print('SRS in terminating:')

        for i in range(2, len(data)-2, 2):
            data[i] = data[i].strip()
            coef = data[i].split(' ')[1]
            val = data[i+1].strip().strip(')')
            f_name = coef[1]
            if f_name not in coefficients:
                coefficients[f_name] = {}
            coefficients[f_name][coef[0]] = val

        for func in coefficients:
            coefs = coefficients[func]
            print(f'{func} = (w*{coefs["A"]} + {coefs["B"]})x + w*{coefs["C"]} + {coefs["D"]}')


if __name__ == '__main__':
    test_name = 'test.txt'
    smt_input = 'smtInput.smt2'
    result_name = 'result.txt'

    if len(sys.argv) == 2:
        test_name = sys.argv[1]

    srs = srs.SRS(test_name)
    srs.make_smt(smt_input)
    subprocess.call(f'z3 -smt2 {smt_input} > {result_name}', shell=True)
    parse_smt_result(result_name)

