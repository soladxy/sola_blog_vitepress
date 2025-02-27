# Mysql笔记（《MySQL技术内幕， InnoDb存储引擎》）

## 第一章 MySQL体系结构和储存引擎

### 1.1 定义数据库和实例

* 数据库：物理操作系统文件或其他形式文件类型的集合
    * 文件可能是frm、MYD、MYI、ibd结尾的文件
    * 使用NDB引擎是，数据库的文件可能不是操作系统上的文件，而是存放于内存中的文件
* 实例：MySQL数据库由后台线程以及一个
    * 共享的内存可以被运行的后台线程共享
    * 数据库实例才是真正操作数据库文件的

在MySQL中实例和数据库一般是一一对应的，即一个实例对应一个数据库，一个数据库对应一个实例。但是在集群情况下可能存在一个数据库被多个数据实例使用的情况。

MySQL是一个单进程多线程的数据库，MySQL数据库实例在系统上表现就是一个进程。

当启动实例的时候，MySQL会去读取配置文件，根据配置文件的参数来启动数据库实例。如果没有配置文件，会按照编译时的默认参数启动实例。用
`mysql --help | grep my.cnf`可以查看从哪里查询配置文件

![linux mysql 配置文件](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211209215551773.png)

![windows mysql 配置文件](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211209220500113.png)

如果有多个配置文件，并且都包含相同的配置，会以最后一个出现的文件中的参数为准

配置参数中有一个datadir，该参数指定了数据库所在路径。`show variables like 'datadir';`

![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211211152045773.png)

### 1.2 MySQL体系结构

* 数据库：文件的集合，是依照某种数据模型组织起来并存放于二级储存器中的数据集合
* 数据库实例：是程序，是位于用户和操作系统之间的一层数据管理软件

大白话：数据库是文件，用于储存数据，crud操作通过数据库实例（software）去实现

![MySQL体系架构](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/20190218162644838.jpg)

上图是mysql官方文档中的图片，有以下几个部分

| 名称          | 作用                                                                                                                                                        |
|:------------|:----------------------------------------------------------------------------------------------------------------------------------------------------------|
| 连接池组件       | 由于每次建立建立需要消耗很多时间，连接池的作用就是将这些连接缓存下来，下次可以直接用已经建立好的连接，提升服务器性能。                                                                                               |
| 管理服务和工具组件   | 系统管理和控制工具，例如备份恢复、Mysql复制、集群等                                                                                                                              |
| SQL接口组件     | 接受用户的SQL命令，并且返回用户需要查询的结果。比如select from就是调用SQL Interface                                                                                                   |
| 查询分析器组件     | SQL命令传递到解析器的时候会被解析器验证和解析。解析器是由Lex和YACC实现的，是一个很长的脚本， 主要功能：<br/>1. 将SQL语句分解成数据结构，并将这个结构传递到后续步骤，以后SQL语句的传递和处理就是基于这个结构的<br/>2. 如果在分解构成中遇到错误，那么就说明这个sql语句是不合理的 |
| 优化器组件       | 查询优化器，SQL语句在查询之前会使用查询优化器对查询进行优化。他使用的是“选取-投影-联接”策略进行查询。                                                                                                    |
| 缓冲（Cache）组件 | 查询缓存，如果查询缓存有命中的查询结果，查询语句就可以直接去查询缓存中取数据。<br/>通过LRU算法将数据的冷端溢出，未来得及时刷新到磁盘的数据页，叫脏页。                                                                           |
| 插件式储存引擎     | 存储引擎。存储引擎是MySql中具体的与文件打交道的子系统。也是Mysql最具有特色的一个地方。 <br/>Mysql的存储引擎是插件式的。它根据MySql AB公司提供的文件访问层的一个抽象接口来定制一种文件访问机制（这种访问机制就叫存储引擎）                               |
| 物理文件        |                                                                                                                                                           |

插件式的存储引擎架构提供了一系列标准管理和服务支持，这些与存储引擎本身无关。存储引擎是底层物理机构的实现，每个储存引擎开发者可以按照自己的意愿开发。

> 字节的new sql就是重写了innodb引擎

**储存引擎是基于表的，不是基于数据库的**

### 1.3 MySQL储存引擎

#### 1.3.1 Innodb

* 支持事务，行锁设计，支持外键，默认读取不会产生锁
* 5.5.8之后，innodb成为默认储存引擎
* 他将数据放在一盒逻辑表空间里，表空间有innodb自身管理，从4.1开始每个表单独放到一个独立的idb文件中。
* 同时innodb支持用裸设备（row disk）用来建立其表空间
* 使用多版本并发控制（MVCC）来获取高并发性
* 实现四种隔离级别，默认为REPEATABLE
* 使用next-key locking 策略来避免幻读
* 提供插入缓冲（insert buffer）、二次写（double write）、自适应哈希（adaptive hash）、预读（read ahead）等功能
* 数据存储采用聚集（clustered）的方式，每张表按照主键顺序存放。**如果没有显式定义主键，会为每一行生成一个6字节的ROWID作为主键
  **

#### 1.3.2 MyISAM

* 不支持事务、表锁设计，支持全文索引
* 5.5.8之前是mysql的默认存储引擎（windows除外）
* 缓冲池值缓存（cache）索引文件，不缓存数据文件，**数据文件的缓存交给os**
* 组成：由MYD和MYI组成，MDY储存数据文件，MYI储存索引文件。可以用myisampack进一步压缩数据文件（myisampack用Huffman编码静态压缩，压缩后为只读，也可解压数据文件）
* 5.0之前，默认支持的表大小为4GB，如果需要支持大于4GB，需要指定`MAX_ROWS`和`AVG_ROW_LENGTH`属性。5.0之后默认支持256TB的单表数据
* 5.1.23之前，无论32位还是64位，缓冲区最大支持4GB，之后版本64位可以支持大于4GB的索引缓冲区

#### 1.3.3 NDB

* 是一个集群存储引擎，其结构是share nothing
* 数据全部在内存中（5.1之开始非索引文件可以放在磁盘上），主键查找极快
* 添加NDB数据存储节点（Data Node）可以线性提高数据库性能
* 连接操作（JOIN）是在数据库层完成的，不是在储存引擎完成的，复杂的连接操作查询速度很慢

#### 1.3.4 Memory(之前称为HEAP)

* 将表中的数据存放在内存中，db重启或崩溃后，数据丢失
* 默认使用hash索引
* 只支持表锁，并发性能差
* 不支持TEXT和BLOB列类型，储存varchar使用char的方式，浪费空间
* **mysql使用memory作为临时表存放查询的中间结果集**。如果中间结果大于memory容量或者包含TEXT和BLOB，会自动转为myisam，因为myisam不缓存数据文件，性能会有损失

#### 1.3.5 Archive

* 只支持INSTER和SELECT操作
* 5.1之后支持索引
* 使用zlib算法将数据行（row）压缩后储存，压缩比一般为1:10。
* 使用行锁实现高并发的插入操作，本事并不是事务安全的储存引擎
* 适合于储存归档数据，提供告诉的插入和压缩功能

#### 1.3.6 Federated

* 只是指向remote MYSQL服务器上的表。

#### 1.3.7 Maria

* 可以看做MyIsam的后续版本
* 支持缓存数据和索引文件，应用了行锁设计，提供MVCC功能，支持事务和非事务安全的选项，以及更好的BLOB字符类型的处理性能

### 1.4 各储存引擎的比较

| 特点 feature                                        | MyISAM  | BDB    | MEMORY  | Innodb | Archive   | NDB   |
|---------------------------------------------------|---------|--------|---------|--------|-----------|-------|
| 储存限制 storage limits                               | no      | no     | yes     | 64tb   | no        | yes   |
| 事务 transaction(commit, rollback, etc.)            |         | √      |         | √      |           |       |
| 锁粒度 locking granularity                           | 表 table | 页 page | 表 table | 行 row  | 行 row     | 行 row |
| mvcc/快照读取 MVCC/snapshot read                      |         |        |         | √      | √         | √     |
| 地理空间支持（网上相关资料较少） geospatial support               | √       |        |         |        |           |       |
| b树索引 B-Tree indexes                               | √       | √      | √       | √      |           | √     |
| 哈希索引 hash indexes                                 |         |        | √       | √      |           | √     |
| 全文检索索引 full text search index                     | √       |        |         |        |           |       |
| 聚簇索引 clustered index                              |         |        |         | √      |           |       |
| 数据缓存 data caches                                  |         |        | √       | √      |           | √     |
| 索引缓存 index caches                                 | √       |        | √       | √      |           | √     |
| 数据压缩 compressed data                              | √       |        |         |        | √         |       |
| 通过函数加密数据 encrypted data(via function)             | √       | √      | √       | √      | √         | √     |
| 储存成本（空间使用） storage cost(space used)               | low     | low    | N/A     | high   | very low  | low   |
| 内存成本 memory cost                                  | low     | low    | medium  | high   | low       | high  |
| 批量插入速度 bulk insert speed                          | high    | high   | high    | low    | very high | high  |
| 集群db支持 cluster database support                   |         |        |         |        |           | √     |
| 复制支持 replication support                          | √       | √      | √       | √      | √         | √     |
| 外键支持 foreign key support                          |         |        |         | √      |           |       |
| 备份/时间点恢复 backup/point-in-time recovery            | √       | √      | √       | √      | √         | √     |
| 查询缓存支持 query cache support                        | √       | √      | √       | √      | √         | √     |
| 更新数据字典的统计信息 update statistics for data dictionary | √       | √      | √       | √      | √         | √     |

可以使用`show engines`语句查询当前数据支持的储存引擎，或者是
`information_schema.ENGINES`![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211211152128110.png)![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211211151218492.png)

### 1.5 连接MySQL

#### 1.5.1 TCP/IP

* mysql在任意平台下都提供的方法

```shell [bash]
mysql -h[ip] -u username -p pwd
```

![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211211151855390.png)

*
使用tcp/ip连接时，mysql会先查询一张权限视图，用来发起请求的客户端ip是否允许允许连接到实例，视图在mysql架构下的user表![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211211153037839.png)

#### 1.5.2 命名管道和共享内存

* 在windows 2000以上平台，如果两个需要进程通信的进程在同一台服务器，可以使用命名管道。
* mysql需要在配置文件中启用`--enable-named-pipe`
* 在4.1之后，mysql还提供共享内存连接的方法，需要在配置文件天极爱`--share-memory`。如果想使用共享内存，还需要在mysql客户端使用
  `--protocol-memory`选项

#### 1.5.3 UNIX域套接字

* 在Linux和UNIX环境下使用
* 只能在mysql客户端和数据库实例在一太服务器上的情况下使用
* 需要在配置文件中指定套接字的路径，eg:`--socket=/tmp/mysql.sock`

## 第二章Innodb存储引擎

### 2.1 概述

* 5.5之后默认为表的存储引擎（之前版本Innodb只是windows下的默认引擎）
* 是一个完整支持ACID事务的Mysql储存引擎（BDB是第一个支持事务的引擎）
* 特点为 行锁设计，支持MVCC，支持外键，提供一致性非锁定读，同时被设计用来最有效的利用以及使用内存和CPU。

### 2.2 Innodb版本

* 早期版本随Mysql更新而更新，mysql5.1之后，mysql允许储存引擎开发商以动态方式加载引擎。、

* 5.1可以支持两个版本的innodb：

    1. 静态编译的innodb，可以视为老版本

    2. 动态加载的innodb，官方称为`innodb Plugin`，可将其视为Innodb 1.0.X版本

       | 版本   | 功能                                                   |
                   | ------ | ------------------------------------------------------ |
       | 老版本 | 支持ACID、行锁设计、MVCC                               |
       | 1.0.x  | 继承上述版本所有功能，增加了compress和dynamic页格式    |
       | 1.1.x  | 继承上述版本所有功能，增加了Linux AIO、多回滚段        |
       | 1.2.x  | 继承上述版本所有功能，增加了全文索引支持、在线索引添加 |

### 2.3 Innodb体系架构

![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213204125063.png)

#### 2.3.1 后台线程

Innodb存储引擎是多线程模型，因此其后台有多个不同的后台线程，负责处理不同的任务

1. Master Thread

   Master Thread是一个非常核心的后台线程，主要负责将缓冲池中的数据异步刷新到磁盘，保证数据的一致性，包括脏页的属性，合并插入缓冲（INSERT
   BUFFER）、UNDO页的回收

2. IO Thread

    * innodb中大量使用AIO（Async IO）来处理写IO请求，这样可以极大提高数据库性能。

    * IO Thread主要工作是负责这些IO请求的回调（call back）处理

    * innodb 1.0之前有4个IO Thread，分别是write，read，insert buffer和log。

    * Linux下不可以调整数量，windows可以通过参数`innodb_file_io_threads`来增大。innodb 1.0.x版本开始，`read thread`和
      `write thread`分别增大到了4个，并且不在使用`innodb_file_io_threads`，而是分别使用`innodb_read_io_threads`和
      `innodb_write_io_threads`

      ```shell [bash]
      show variables like 'innodb_version'; #innodb版本
      show variables like 'innodb_%io_threads'; # 查询io thread数量
      ```

      ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213205527091.png)![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213205629254.png)

      ```shell [bash]
      show engine innodb status; # 观察IOThread
      ```

      ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213210155606.png)

3. Purge Thread

    * 事务被提交后，所使用的的undolog可能不再需要，因此需要Purge Thread来回收已经使用的并分配的undo页。

    * 在innodb1.1版本之前，purge操作尽在Master Thread中完成，1.1之后，purge可以独立到单独的线程中进行，用来减轻Master
      Thread的工作，从而提高CPU的使用率以及提升存储引擎的性能

    * 在文件中加入如下命令来启用独立的Purge Thread：

      ```shell [bash]
      [mysqld]
      innodb_purge_thread=1
      ```

      在innodb1.1版本中，即使innodb_purge_thread设为大于1，innodb也会在启动时设置为1，并在错误文件中出现提示

      1.2之后，支持了多个Purge Thread，这样进一步的加快undo页的回收。由于Purge Thread需要离散的读取undo页，这样也能更进一步利用磁盘随机读取性能

      ```shell [bash]
      show variables like 'innodb_purge_threads';
      ```

     ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213212117251.png)

4. Page Cleaner Thread

    * 在innodb1.2.x版本引入。
    * 将之前版本中脏页的刷新操作都放入单独的线程，减轻Master Thread的工作

#### 2.3.2 内存

1. 缓冲池

    * innodb基于磁盘存储，并将其中的记录按照页的方式进行管理，为了减少cpu和磁盘之间速度的差距，使用了缓冲的技术。

    * 缓冲池是在内存上开辟的一块区域，db读取页的时候，首先从磁盘读到页存放在缓冲池中（将页“FIX”在缓冲池中），下次读取到相同的页的时候，先判断是否在缓冲池中，命中则直接从缓存中读取。

    * db对页的修改操作，先修改缓冲池中的页，然后再以一定的频率属性到磁盘上。触发缓冲池刷新回磁盘的机制是checkpoint。

    * 通过`innodb_buffer_pool_size`来调整缓冲池大小

      ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213214319985.png)

    * 缓存池中的数据页类型有

        1. 索引页
        2. 数据页
        3. undo页
        4. 插入缓冲
        5. 自适应哈希索引
        6. Innodb存储的锁信息
        7. 数据字典信息
        8. ...

      ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213214537247.png)

    * innodb1.0.x版本开始，允许有多个缓冲池实例。每页根据hash值平均分配到不同的缓冲池实例中。通过
      `innodb_buffer_pool_instances`配置，可以用`show engine innodb status`观察。5.6之后可以通过
      `information_schema.INNODB_BUFFER_POOL_STATS`表来查询

      ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213215237308.png)

      ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213215514357.png)

      ```sql [mysql]
      SELECT POOL_ID, POOL_SIZE, FREE_BUFFERS, DATABASE_PAGES FROM INNODB_BUFFER_POOL_STATS;
      ```

      ![](https://dxytoll-img-1304942391.cos.ap-nanjing.myqcloud.com/img/image-20211213220158951.png)

2. LRU List、Free List 和 Flush List