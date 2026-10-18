#!/usr/bin/env python3
"""Run as root ONLY inside the disposable Linux 6.8 VM with the lab loaded."""
import concurrent.futures
import errno
import os
import stat
import unittest

DEVICE = "/dev/learn_sensor"


def write_value(data):
    with open(DEVICE, "wb", buffering=0) as device:
        return device.write(data)


def read_value():
    with open(DEVICE, "rb", buffering=0) as device:
        return device.read()


class SensorTests(unittest.TestCase):
    def test_permissions_and_type(self):
        info = os.stat(DEVICE)
        self.assertTrue(stat.S_ISCHR(info.st_mode))
        self.assertEqual(stat.S_IMODE(info.st_mode), 0o600)

    def test_boundaries(self):
        for value in (-40000, 0, 25000, 125000):
            data = f"{value}\n".encode()
            self.assertEqual(write_value(data), len(data))
            self.assertEqual(read_value(), data)

    def test_invalid_writes_preserve_value(self):
        write_value(b"31000\n")
        for data, expected in (
            (b"bad\n", errno.EINVAL),
            (b"-40001\n", errno.ERANGE),
            (b"125001\n", errno.ERANGE),
            (b"9999999999999999\n", errno.EINVAL),
        ):
            with self.assertRaises(OSError) as error:
                write_value(data)
            self.assertEqual(error.exception.errno, expected)
            self.assertEqual(read_value(), b"31000\n")

    def test_partial_reads_and_eof(self):
        write_value(b"25000\n")
        with open(DEVICE, "rb", buffering=0) as device:
            self.assertEqual(device.read(2), b"25")
            self.assertEqual(device.read(2), b"00")
            self.assertEqual(device.read(2), b"0\n")
            self.assertEqual(device.read(2), b"")

    def test_concurrent_readers_and_writers(self):
        values = {25000, -40000, 0, 31000, 125000}
        write_value(b"25000\n")

        def worker(index):
            value = sorted(values)[index % len(values)]
            for _ in range(100):
                write_value(f"{value}\n".encode())
                # A single read is a coherent snapshot; another writer may win.
                self.assertIn(int(read_value()), values)

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(worker, range(8)))


if __name__ == "__main__":
    if os.name != "posix" or os.geteuid() != 0:
        raise SystemExit("Run with sudo only inside the disposable Linux VM.")
    unittest.main()
