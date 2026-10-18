// SPDX-License-Identifier: GPL-2.0
#include <linux/errno.h>
#include <linux/fs.h>
#include <linux/init.h>
#include <linux/kernel.h>
#include <linux/kstrtox.h>
#include <linux/miscdevice.h>
#include <linux/module.h>
#include <linux/mutex.h>
#include <linux/uaccess.h>

static DEFINE_MUTEX(sensor_lock);
static int temperature_mc = 25000;

static ssize_t sensor_read(struct file *file, char __user *user,
			   size_t count, loff_t *ppos)
{
	char text[16];
	int length;

	mutex_lock(&sensor_lock);
	length = scnprintf(text, sizeof(text), "%d\n", temperature_mc);
	mutex_unlock(&sensor_lock);

	return simple_read_from_buffer(user, count, ppos, text, length);
}

static ssize_t sensor_write(struct file *file, const char __user *user,
			    size_t count, loff_t *ppos)
{
	int value;
	int ret;

	if (count == 0 || count >= 16)
		return -EINVAL;
	ret = kstrtoint_from_user(user, count, 10, &value);
	if (ret)
		return ret;
	if (value < -40000 || value > 125000)
		return -ERANGE;

	mutex_lock(&sensor_lock);
	temperature_mc = value;
	mutex_unlock(&sensor_lock);

	return count;
}

static const struct file_operations sensor_fops = {
	.owner = THIS_MODULE,
	.read = sensor_read,
	.write = sensor_write,
	.llseek = no_llseek,
};

static struct miscdevice sensor_device = {
	.minor = MISC_DYNAMIC_MINOR,
	.name = "learn_sensor",
	.fops = &sensor_fops,
	.mode = 0600,
};

static int __init sensor_init(void)
{
	int ret = misc_register(&sensor_device);

	if (ret) {
		pr_err("learn_sensor: registration failed: %d\n", ret);
		return ret;
	}
	pr_info("learn_sensor: registered /dev/learn_sensor\n");
	return 0;
}

static void __exit sensor_exit(void)
{
	misc_deregister(&sensor_device);
	pr_info("learn_sensor: unregistered\n");
}

module_init(sensor_init);
module_exit(sensor_exit);
MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Mutex-protected teaching sensor for Linux 6.8");
